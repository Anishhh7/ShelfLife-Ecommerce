import {
  ItemStatus,
  PaymentMethod,
  Prisma,
} from '../generated/prisma/client';
import { logger } from '../lib/logger';
import prisma from '../lib/prisma';
import { orderQuery } from '../query/orderQuery';
import emailQueue from '../queue/email.queue';
import AppError from '../utils/AppError';
import {
  orderPlacedEmail,
  vendorOrderReceivedEmail,
} from '../utils/emailTemplates';

export const placeOrder = async (
  userId: number,
  addressId: number,
  cartItemsIds: number[],
  paymentMethod: PaymentMethod
) => {
  const cart = await prisma.cart.findUnique({
    where: {
      userId: userId,
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              vendor: true,
            },
          },
        },
      },
    },
  });

  if (!cart || !cart.items.length) {
    logger.warn({ userId }, 'User cart is empty, cannot place order');
    throw new AppError('Cart items not found ', 400);
  }

  const selectedItems = cart.items.filter((item) =>
    cartItemsIds.some((selected) => selected === item.id)
  );

  if (!selectedItems || !selectedItems.length) {
    throw new AppError('can not find the product', 400);
  }

  const address = await prisma.address.findFirst({
    where: addressId
      ? { id: addressId, userId }
      : { userId, isDefault: true },
  });

  if (!address) {
    throw new AppError('Address not found', 404);
  }

  const outOfStock = selectedItems.find(
    (item) => (item.quantity ?? 0) > item.product.stock
  );

  if (outOfStock) {
    logger.warn(
      {
        cartItemsIds,
        userId,
        productId: outOfStock.productId,
        requestedQuantity: outOfStock.quantity,
        availableStock: outOfStock.product.stock,
      },
      'Requested product quantity exceeds available stock'
    );
    throw new AppError(
      'Requested quantity exceeds the available stock',
      400
    );
  }

  const unavailableProduct = selectedItems.find(
    (item) =>
      !item.product.active ||
      !item.product.vendor.approved ||
      !item.product.vendor.active
  );

  if (unavailableProduct) {
    throw new AppError('Sorry currently this is out of service', 400);
  }

  const lineTotal = selectedItems.reduce(
    (total, item) =>
      total.plus(item.product.price.mul(item.quantity)),
    new Prisma.Decimal(0)
  );

  const taxTotal = lineTotal.mul(new Prisma.Decimal(0.02));

  const totalAmount = lineTotal.plus(taxTotal);

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      name: true,
      email: true,
      storeName: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        orderNumber: `ORD-SHEF-${Date.now()}`,
        userId,

        shippingFullName: address.fullName,
        shippingPhone: address.mobileNumber,
        shippingEmail: address.email,
        shippingLine1: address.addressLine1,
        shippingLine2: address.addressLine2,
        shippingCity: address.city,
        shippingProvince: address.province,
        shippingPostalCode: address.postalCode,
        shippingCountry: address.country,

        subtotal: lineTotal,
        taxTotal: taxTotal,
        totalAmount: totalAmount,
        paymentMethod: paymentMethod,
      },
    });

    await tx.orderItem.createMany({
      data: selectedItems.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        vendorId: item.product.vendorId,
        productName: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        lineTotal: lineTotal,
      })),
    });

    await Promise.all(
      selectedItems.map((item) =>
        tx.product.update({
          where: {
            id: item.productId,
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        })
      )
    );

    await tx.item.deleteMany({
      where: {
        id: {
          in: cartItemsIds,
        },

        cartId: cart.id,
      },
    });
    logger.info(
      {
        userId,
        orderId: order.id,
        orderNumber: order.orderNumber,
        paymentMethod,
      },
      'Order created successfully'
    );
    const customerEmail = orderPlacedEmail(
      user.name,
      order.orderNumber,
      order.totalAmount.toString()
    );

    await emailQueue.add('order-placed-email', {
      email: user.email,
      ...customerEmail,
    });

    const vendors = new Map(
      selectedItems.map((item) => [
        item.product.vendorId,
        item.product.vendor,
      ])
    );

    await Promise.all(
      Array.from(vendors.values()).map((vendor) =>
        emailQueue.add('vendor-order-received-email', {
          email: vendor.email,
          ...vendorOrderReceivedEmail(
            vendor.name,
            vendor.storeName!,
            order.orderNumber
          ),
        })
      )
    );

    return order;
  });
};

export const canCancel = async (
  orderId: number,
  userId: number,
  reason?: string
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      name: true,
      email: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const checkOrder = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              vendor: {
                include: {
                  products: true,
                },
              },
            },
          },
        },
      },
    },
  });
  if (!checkOrder) {
    throw new AppError('Order is not found', 400);
  }

  const canCancel = checkOrder.items.every(
    (item) =>
      item.itemStatus === ItemStatus.Pending ||
      item.itemStatus === ItemStatus.Confirmed
  );

  if (!canCancel) {
    throw new AppError(
      'Your order cannot be cancelled because it is already being processed or delivered.',
      400
    );
  }

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: 'Cancelled',
        statusHistory: {
          create: {
            status: 'Cancelled',
            updatedBy: userId,
            reason,
          },
        },
      },
    });

    await Promise.all(
      checkOrder.items.map((item) => {
        return tx.product.update({
          where: {
            id: item.product.id,
          },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      })
    );

    logger.info(
      { orderId: orderId, userId },
      'Order cancelled successfully'
    );

    logger.warn(
      { orderId, userId },
      'Order not found for cancellation'
    );

    const cancelledEmail = orderPlacedEmail(
      user.name,
      order.orderNumber,
      reason!
    );
    await emailQueue.add('order-cancelled-email', {
      email: user.email,
      ...cancelledEmail,
    });
    return order;
  });
};

export const getOrderTracking = async (
  orderId: number,
  userId: number
) => {
  if (isNaN(orderId)) {
    throw new AppError('Invalid order ID', 400);
  }
  const checkOrder = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: {
      items: {
        include: {
          statusHistory: true,
        },
      },
    },
  });

  if (!checkOrder) {
    throw new AppError('No order found with that ID', 400);
  }

  logger.info(
    { orderId, userId },
    'Order tracking fetched successfully'
  );

  return {
    paymentStatus: checkOrder.paymentStatus,
    PaymentMethod: checkOrder.paymentMethod,
    items: checkOrder.items.map((item) => ({
      productName: item.productName,
      currentStatus: item.itemStatus,
      statusHistory: item.statusHistory,
    })),
  };
};

export const getAllMyOrders = async (
  userId: number,
  query: unknown
) => {
  return orderQuery.list(query, { userId });
};

export const getAllVendorOrders = async (
  vendorId: number,
  query: unknown
) => {
  return orderQuery.list(query, { vendorId });
};

export const getAllOrders = async (query: unknown) => {
  return orderQuery.list(query, {});
};

const allowedTransitions: Partial<Record<ItemStatus, ItemStatus>> = {
  Pending: ItemStatus.Confirmed,
  Confirmed: ItemStatus.Packed,
  Packed: ItemStatus.Shipped,
  Shipped: ItemStatus.OutForDelivery,
  OutForDelivery: ItemStatus.Delivered,
};

export const updateVendorItemStatus = async (
  vendorId: number,
  itemId: number,
  status: ItemStatus
) => {
  const orderItem = await prisma.orderItem.findFirst({
    where: {
      id: itemId,
      vendorId,
    },
  });

  if (!orderItem) {
    logger.warn({ vendorId, itemId }, 'Vendor order item not found');
    throw new AppError('Order can not found', 404);
  }

  const allowedNextStatus =
    allowedTransitions[orderItem.itemStatus as ItemStatus];

  if (allowedNextStatus !== status) {
    throw new AppError(
      `Cannot change status from ${orderItem.itemStatus} to ${status}`,
      400
    );
  }
  logger.info(
    { vendorId, itemId, status },
    'Vendor item status updated successfully'
  );

  return prisma.orderItem.update({
    where: {
      id: itemId,
    },
    data: {
      itemStatus: status,
      statusHistory: {
        create: {
          status,
          fromStatus: orderItem.itemStatus,
          updatedById: vendorId,
        },
      },
    },
  });
};

export const updateAdminItemStatus = async (
  itemId: number,
  userId: number,
  status: ItemStatus,
  reason?: string
) => {
  const orderItem = await prisma.orderItem.findUnique({
    where: {
      id: itemId,
    },
  });

  if (!orderItem) {
    throw new AppError('Order item not found', 404);
  }

  const allowedNextStatus =
    allowedTransitions[orderItem.itemStatus as ItemStatus];

  if (allowedNextStatus !== status) {
    throw new AppError(
      `Cannot change status from ${orderItem.itemStatus} to ${status}`,
      400
    );
  }

  logger.info(
    { itemId, status },
    'Admin item status updated successfully'
  );

  logger.warn({ itemId }, 'Admin order item not found');

  return prisma.orderItem.update({
    where: {
      id: itemId,
    },
    data: {
      itemStatus: status,
      statusHistory: {
        create: {
          status,
          fromStatus: orderItem.itemStatus,
          reason:
            status === ItemStatus.Cancelled ? (reason ?? null) : null,
          updatedById: userId,
        },
      },
    },
    include: {
      statusHistory: {
        include: {
          updatedBy: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
        },
      },
    },
  });
};
