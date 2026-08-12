import catchAsync from '../Utils/catchAsync.js';
import AppError from '../Utils/appError.js';
import sendResponse from '../Utils/sendResponse.js';
import Cart from '../Model/cartModel.js';
import Product from '../Model/productModel.js';

export const addToCart = catchAsync(async (req, res, next) => {
  const { productId, quantity } = req.body;

  const product = await Product.findById(productId);

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

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
  } else {
    cart.items.push({
      product: product._id,
      vendor: product.vendor,
      productName: product.name,
      price: product.price,
      quantity,
    });
  }

  await cart.save();

  sendResponse(res, 200, cart);
});

export const updateCartItem = catchAsync(async (req, res, next) => {
  const { quantity } = req.body;
  const { productId } = req.params;
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
  const { productId } = req.params;
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

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId
  );

  await cart.save();
  sendResponse(res, 204, null, 'Cart product deleted successfully');
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
    product: item.product._id,
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

export const removeMultipleCartItems = catchAsync(
  async (req, res, next) => {
    const { productIds } = req.body;

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return next(new AppError('Cart not found', 404));
    }

    cart.items = cart.items.filter(
      (item) => !productIds.includes(item.product.toString())
    );

    await cart.save();

    sendResponse(res, 200, cart, 'Cart items removed successfully');
  }
);
