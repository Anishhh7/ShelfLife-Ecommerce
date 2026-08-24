import AppError from '../utils/AppError';
import prisma from '../lib/prisma';
import { PaymentMethod, Prisma } from '../generated/prisma/client';
import { logger } from '../lib/logger';

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

  console.log('USER ID:', userId);
  console.log('CART:', cart);

  if (!cart || !cart.items.length) {
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
      { orderId: order.id, userId, paymentMethod },
      'Order created successfully'
    );
    return order;
  });
};
