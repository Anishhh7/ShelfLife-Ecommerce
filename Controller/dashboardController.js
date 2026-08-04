import catchAsync from '../Utils/catchAsync.js';
import AppError from '../Utils/appError.js';
import Order from '../Model/orderModel.js';
import sendResponse from '../Utils/sendResponse.js';
import Product from '../Model/productModel.js';
import { getMyProduct } from './productController.js';
import User from '../Model/userModel.js';

export const vendorDashboard = catchAsync(async (req, res, next) => {
  const vendorId = req.user.id;
  const totalRevenues = Order.aggregate([
    { $match: { 'items.vendor': vendorId } },
    { $unwind: '$items' },
    {
      $match: { 'items.vendor': vendorId },
    },
    {
      $group: {
        _id: null,
        totalRevenue: {
          $sum: { $multiply: ['$items.quantity', '$items.price'] },
        },
      },
    },
  ]);

  const [stats, totalOrder, pendingItems, TotalProduct] =
    await Promise.all([
      totalRevenues,
      Order.countDocuments({ 'items.vendor': vendorId }),
      Order.countDocuments({
        'items.vendor': vendorId,
        'items.itemStatus': 'Pending',
      }),
      Product.countDocuments({
        vendor: vendorId,
      }),
    ]);

  const topSellingProduct = await Order.aggregate([
    { $match: { 'items.vendor': vendorId } },
    { $unwind: '$items' },
    { $match: { 'items.vendor': vendorId } },
    {
      $group: {
        _id: '$items.product',
        totalSold: { $sum: '$items.quantity' },
      },
    },
    {
      $sort: { totalSold: -1 },
    },
    {
      $limit: 5,
    },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'topSellingProduct',
      },
    },
    {
      $unwind: '$topSellingProduct',
    },
  ]);

  sendResponse(res, 200, {
    totalRevenues: stats[0]?.totalRevenue || 0,
    totalOrder,
    pendingItems,
    TotalProduct,
    topSellingProducts: topSellingProduct,
  });
});

export const adminDashboard = catchAsync(async (req, res, next) => {
  const [
    totalOrder,
    totalPendingOrder,
    totalVendor,
    totalPendingVendor,
    totalProduct,
    totalCustomer,
  ] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ 'items.itemStatus': 'Pending' }),
    User.countDocuments({
      role: 'vendor',
    }),
    User.countDocuments({
      role: 'vendor',
      approved: false,
    }),
    Product.countDocuments(),
    User.countDocuments({ role: 'customer' }),
  ]);

  const totalVendorRevenues = await Order.aggregate([
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.vendor',
        totalRevenue: {
          $sum: { $multiply: ['$items.quantity', '$items.price'] },
        },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'vendorRevenueDetails',
      },
    },
    {
      $unwind: '$vendorRevenueDetails',
    },
  ]);

  const topSellingProduct = await Order.aggregate([
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        topSelling: { $sum: '$items.quantity' },
      },
    },
    {
      $sort: { topSelling: -1 },
    },
    { $limit: 5 },

    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'topSoldItems',
      },
    },
    { $unwind: '$topSoldItems' },
  ]);

  sendResponse(res, 200, {
    totalOrder,
    totalCustomer,
    totalPendingOrder,
    totalPendingVendor,
    totalProduct,
    totalVendor,
    totalRevenueByVendor: totalVendorRevenues,
    topSellingProducts: topSellingProduct,
  });
});

export const customerDashboard = catchAsync(
  async (req, res, next) => {
    const userId = req.user.id;
    const [totalOrder, toShip, toDelivered, toCancelled] =
      await Promise.all([
        Order.countDocuments({ user: userId }),
        Order.countDocuments({
          user: userId,
          'items.itemStatus': {
            $in: ['Pending', 'Confirmed', 'Packed', 'Shipped'],
          },
        }),
        Order.countDocuments({
          user: userId,
          'items.itemStatus': 'Delivered',
        }),
        Order.countDocuments({
          user: userId,
          'items.itemStatus': 'Cancelled',
        }),
      ]);

    sendResponse(res, 200, {
      totalOrder,
      toShip,
      toDelivered,
      toCancelled,
    });
  }
);
