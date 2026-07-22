import catchAsync from '../Utils/catchAsync.js';
import AppError from '../Utils/appError.js';
import sendResponse from '../Utils/sendResponse.js';
import Cart from '../Model/cartModel.js';

export const addToCart = catchAsync(async (req, res, next) => {
  const { productId, quantity } = req.body;
  let cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    cart = await Cart.create({
      user: req.user.id,
      items: [
        {
          product: productId,
          quantity,
        },
      ],
    });
    return sendResponse(res, 201, cart, 'Cart created successfully');
  }

  const item = cart.items.find(
    (item) => item.product.toString() === productId
  );

  if (item) {
    item.quantity += quantity;
  }

  if (!item) {
    cart.items.push({
      product: productId,
      quantity,
    });
  }

  await cart.save();

  sendResponse(res, 200, cart);
});

export const updateCartItem = catchAsync(async (req, res, next) => {
  const { productId, quantity } = req.body;
  let cart = await Cart.findOne({ user: req.params.id });

  const item = cart.items.find(
    (item) => item.product.toString() === productId
  );

  if (!item) {
    return next(new AppError('Product not found in cart', 404));
  }
  items.quantity = quantity;

  await product.save();

  sendResponse(res, 200, cart, 'Cart updated sucessfully');
});

export const removeCartItem = catchAsync(async (req, res, next) => {
  const { productId, quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    return next(new AppError('Cart not found', 404));
  }

  const item = cart.items.find(
    (item) => item.product.toString() === productId
  );

  if (!item) {
    return next(new AppError('Product not found in cart', 404));
  }
  if (item.quantity <= quantity) {
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );
  } else {
    item.quantity -= quantity;
  }
  await cart.save();
  sendResponse(res, 204, cart, 'Cart updated successfully');
});
