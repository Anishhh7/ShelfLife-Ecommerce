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
  let cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    return next(new AppError('Cart not found', 404));
  }

  const item = cart.items.find(
    (item) => item.product.toString() === productId
  );

  if (!item) {
    return next(new AppError('Product not found in cart', 404));
  }

  item.quantity = quantity;

  await cart.save();

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
    await Cart.updateOne(
      { user: req.user.id },
      { $pull: { items: { product: productId } } }
    );
  } else {
    await Cart.updateOne(
      { user: req.user.id, 'items.product': productId },
      { $inc: { 'items.$.quantity': -quantity } }
    );
  }

  const updateCart = await Cart.findOne({ user: req.user.id });
  sendResponse(res, 200, updateCart, 'Cart updated successfully');
});

export const getCart = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id }).populate(
    'items.product'
  );
  if (!cart) {
    return sendResponse(
      res,
      200,
      {
        items: [],
        total: 0,
      },
      'Cart is empty'
    );
  }

  const items = cart.items.map((item) => ({
    product: item.product.name,
    price: item.product.price,
    quantity: item.quantity,
    available: item.quantity <= item.product.stock,
  }));

  const total = cart.items.reduce((total, item) => {
    const available = item.quantity <= item.product.stock;

    if (available) {
      total += item.quantity * item.product.price;
    }
    return total;
  }, 0);

  sendResponse(
    res,
    200,
    { items, total },
    'Cart fetched successfully'
  );
});

export const clearCart = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user.id },
    { $ser: { items: [] } },
    { returnDocument: 'after' }
  );

  if (!cart) {
    return next(new AppError('Cart not found', 404));
  }

  sendResponse(res, 204, null, 'Cart clear successfully');
});
