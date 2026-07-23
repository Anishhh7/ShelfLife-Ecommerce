import AppError from '../Utils/appError.js';
import catchAsync from '../Utils/catchAsync.js';
import sendResponse from '../Utils/sendResponse.js';
import Order from '../Model/orderModel.js';
import Cart from '../Model/cartModel.js';
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

  const stockCheck = cart.items.find(
    (item) => item.quantity > item.product.stock
  );

  if (stockCheck) {
    return next(
      new AppError(
        'Requested quantity exceeds the available stock',
        400
      )
    );
  }

  const totalAmount = cart.items.reduce((total, item) => {
    total += item.quantity * item.product.price;
    return total;
  }, 0);

  const items = cart.items.map((item) => ({
    product: item.product.id,
    productName: item.product.name,
    price: item.product.price,
    quantity: item.quantity,
  }));

  const order = await Order.create({
    user: req.user.id,
    items,
    totalAmount,
    shippingAddress: req.body.shippingAddress,
    paymentMethod: req.body.paymentMethod,
  });

  await Promise.all(
    cart.items.map(async (item) => {
      item.product.stock -= item.quantity;
      await item.product.save();
    })
  );

  cart.items = [];
  await cart.save();

  sendResponse(res, 201, order, 'Order placed successfully');
});
