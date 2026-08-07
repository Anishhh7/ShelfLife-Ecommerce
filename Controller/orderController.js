import AppError from '../Utils/appError.js';
import catchAsync from '../Utils/catchAsync.js';
import sendResponse from '../Utils/sendResponse.js';
import Order from '../Model/orderModel.js';
import Cart from '../Model/cartModel.js';
import User from '../Model/userModel.js';
import APIFeatures from '../Utils/apiFeatures.js';
import sendEmail from '../Utils/sendEmail.js';
import orderAdminEmail from '../Utils/emailTemplate/administrationEmail.js';
import orderVendorEmail from '../Utils/emailTemplate/vendorEmail.js';
import orderCustomerEmail from '../Utils/emailTemplate/customerEmail.js';
import mongoose from 'mongoose';
import orderDeliveredEmail from '../Utils/emailTemplate/DeliveredEmail.js';
import orderCancelledEmail from '../Utils/emailTemplate/cancelOrderEmail.js';
import Product from '../Model/productModel.js';

export const placeOrder = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id }).populate(
    'items.product'
  );

  if (!cart) {
    return next(new AppError('Cart not found', 404));
  }
  if (cart.items.length <= 0) {
    return next(
      new AppError(
        'Cart is empty. Please try again after added items in cart.',
        400
      )
    );
  }

  const outOfStock = cart.items.find(
    (item) => item.quantity > item.product.stock
  );

  if (outOfStock) {
    return next(
      new AppError(
        'Requested quantity exceeds the available stock',
        400
      )
    );
  }

  const address = await AddressBook.findOne({
    _id: req.body.addressId,
    user: req.user.id,
  });

  if (!address) {
    return next(
      new AppError('Address not found or does not belong to you', 404)
    );
  }

  const totalAmount = cart.items.reduce((total, item) => {
    total += item.quantity * item.product.price;
    return total;
  }, 0);

  const items = cart.items.map((item) => ({
    product: item.product.id,
    vendor: item.product.vendor,
    productName: item.product.name,
    price: item.product.price,
    quantity: item.quantity,
  }));

  const session = await mongoose.startSession();
  let order;
  try {
    session.startTransaction();

    const [newOrder] = await Order.create(
      [
        {
          user: req.user.id,
          items,
          totalAmount,
          shippingAddress: {
            fullName: address.fullName,
            phone: address.phone,
            address: address.address,
            city: address.city,
            postalCode: address.postalCode,
          },
          paymentMethod: req.body.paymentMethod,
        },
      ],
      { session }
    );

    await Promise.all(
      cart.items.map((item) =>
        Product.findByIdAndUpdate(
          item.product.id,
          { $inc: { stock: -item.quantity } },
          { session }
        )
      )
    );

    cart.items = [];
    await cart.save({ session });
    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    return next(err);
  } finally {
    session.endSession();
  }

  try {
    const groupByVendor = order.items.reduce((groups, item) => {
      const vendorId = item.vendor.toString();
      if (!groups[vendorId]) groups[vendorId] = [];
      groups[vendorId].push(item);
      return groups;
    }, {});

    const vendorIds = Object.keys(groupByVendor);
    const vendors = await User.find({ _id: { $in: vendorIds } });

    await sendEmail(
      orderCustomerEmail(order, req.user.email, req.user.name)
    );

    await Promise.all([
      sendEmail(
        orderCustomerEmail(order, req.user.name, req.user.email)
      ),
      sendEmail(
        orderAdminEmail(order, req.user.name, req.user.email)
      ),
      ...vendors.map((vendor) =>
        sendEmail(
          orderVendorEmail(
            order,
            vendor,
            req.user.name,
            req.user.email,
            req.user.phone,
            groupByVendor[vendor.id]
          )
        )
      ),
    ]);
  } catch (err) {
    console.error('Order email notification failed:', err.message);
  }

  sendResponse(res, 201, order, 'Order placed successfully');
});

export const getMyOrders = catchAsync(async (req, res, next) => {
  const filters = new APIFeatures(
    Order.find({
      user: req.user.id,
    }).populate('items.product'),
    req.query
  )
    .filter()
    .search(['items.productName'])
    .sort()
    .limitFields()
    .pagination();

  const orders = await filters.query;

  sendResponse(
    res,
    200,
    {
      items: orders,
      total: orders.length,
    },
    'Orders retrieved successfully'
  );
});

export const getVendorOrders = catchAsync(async (req, res, next) => {
  const filters = new APIFeatures(
    Order.find({ 'items.vendor': req.user.id }),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .pagination();

  const order = await filters.query;

  const stats = await Order.aggregate([
    {
      $match: { 'items.vendor': req.user.id },
    },

    {
      $unwind: '$items',
    },
    {
      $match: { 'items.vendor': req.user.id },
    },
    {
      $lookup: {
        from: 'products',
        localField: 'items.product',
        foreignField: '_id',
        as: 'productDetails',
      },
    },
    { $unwind: '$productDetails' },
  ]);

  sendResponse(res, 200, {
    order,
    summary: stats,
  });
});

export const updateVendorItemStatus = catchAsync(
  async (req, res, next) => {
    const { itemStatus } = req.body;

    const order = await Order.findById(req.params.orderId).populate(
      'user'
    );

    if (!order) {
      return next(new AppError('No order found with that ID', 404));
    }

    const item = order.items.id(req.params.itemId);

    if (!item || item.vendor.toString() !== req.user.id) {
      return next(
        new AppError('Item not found or you are not authorized', 404)
      );
    }
    const allowedTransactions = {
      Pending: 'Confirmed',
      Confirmed: 'Packed',
    };

    if (allowedTransactions[item.itemStatus] !== itemStatus) {
      return next(
        new AppError('Invalid order status transition', 400)
      );
    }

    item.itemStatus = itemStatus;
    item.statusHistory.push({
      status: itemStatus,
      updatedAt: new Date(),
      updatedBy: req.used._id,
    });

    await order.save();

    sendResponse(
      res,
      200,
      order,
      'Order status updated successfully'
    );
  }
);

export const updateAdminItemStatus = catchAsync(
  async (req, res, next) => {
    const { itemStatus } = req.body;

    const query = await Order.findById(req.params.orderId);
    if (itemStatus === 'Delivered') query.populate('user');

    const order = await query;

    if (!order) {
      return next(new AppError('No order found with that ID', 404));
    }

    const item = order.items.id(req.params.itemId);

    if (!item) {
      return next(new AppError('Item not found in this order', 404));
    }

    if (item.itemStatus === itemStatus) {
      return next(
        new AppError(
          `Item is already marked as '${item.itemStatus}'`,
          400
        )
      );
    }

    item.itemStatus = itemStatus;
    item.statusHistory.push({
      status: itemStatus,
      updatedAt: new Date(),
      updatedBy: req.user.id,
    });
    await order.save();

    try {
      if (item.itemStatus === 'Delivered' && order.user?.email) {
        await sendEmail(
          orderDeliveredEmail(
            order,
            order.user.name,
            order.user.email
          )
        );
      }
    } catch (err) {
      console.error('Order email notification failed:', err.message);
    }
    sendResponse(
      res,
      200,
      order,
      'Items status updated successfully'
    );
  }
);

export const getAllOrders = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Order.find(), req.query)
    .filter()
    .search()
    .sort()
    .limitFields()
    .pagination();

  const order = await features.query;

  const total = await Order.countDocuments(features.filterConditions);
  const totalPages = Math.ceil(total / features.limit);

  sendResponse(res, 200, order, undefined, {
    results: order.length,
    total,
    page: features.page,
    totalPages,
  });
});

export const cancelOrder = catchAsync(async (req, res, next) => {
  const checkOrder = await Order.findOne({
    _id: req.params.orderId,
    user: req.user.id,
  });

  if (!checkOrder) {
    return next(new AppError('Order is not found with this id', 404));
  }

  const canCancel = checkOrder.items.every(
    (item) =>
      item.itemStatus === 'Pending' || item.itemStatus === 'Confirmed'
  );

  if (!canCancel) {
    return next(
      new AppError(
        'Your order cannot be cancelled because it is already being processed or delivered.',
        400
      )
    );
  }

  let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const order = await Order.findById(req.params.orderId)
      .populate('items.product')
      .session(session);

    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    order.items.forEach((item) => {
      item.itemStatus = 'Cancelled';

      item.statusHistory.push({
        status: 'Cancelled',
        updatedAt: new Date(),
        updatedBy: req.user.id,
      });
    });

    await Promise.all(
      order.items.map(async (item) => {
        item.product.stock += item.quantity;
        await item.product.save({ session });
      })
    );

    await order.save({ session });

    await session.commitTransaction();

    try {
      await sendEmail(
        orderCancelledEmail(order, req.user.name, req.user.email)
      );
    } catch (err) {
      console.error('Order email notification failed:', err.message);
    }

    sendResponse(
      res,
      200,
      order,
      'Order has been cancelled sucessfully'
    );
  } catch (err) {
    await session.abortTransaction();
    return next(err);
  } finally {
    if (session) {
      session.endSession();
    }
  }
});

export const getOrderTracking = catchAsync(async (req, res, next) => {
  const order = await Order.findOne({
    _id: req.params.id,
    user: req.user.id,
  }).populate('items.product', 'name');

  if (!order) {
    return next(new AppError('No order found with that ID', 404));
  }

  const orderTrack = order.items.map((item) => ({
    productName: item.productName,
    currentStatus: item.itemStatus,
    statusHistory: item.statusHistory,
  }));

  sendResponse(res, 200, orderTrack);
});
