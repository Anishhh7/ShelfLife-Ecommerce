import catchAsync from '../Utils/catchAsync.js';
import AppError from '../Utils/appError.js';
import APIFeatures from '../Utils/apiFeatures.js';
import Wishlist from '../Model/wishlistModel.js';
import sendResponse from '../Utils/sendResponse.js';
import Product from '../Model/productModel.js';

export const addToWishlist = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.body.productId);

  if (!product) {
    return next(
      new AppError('No product is available with that id.', 404)
    );
  }
  let wishlist = await Wishlist.findOne({
    user: req.user.id,
  }).populate('items.product');

  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: req.user.id,
      items: [
        {
          product: req.body.productId,
        },
      ],
    });
    return sendResponse(
      res,
      201,
      wishlist,
     `${product.name} has been successfully added to your wishlist`
    );
  }

  const item = wishlist.items.find(
    (item) => item.product.toString() === req.body.productId
  );
  if (item) {
    return next(
      new AppError('This is already in your wishlist', 409)
    );
  }
  if (!item) {
    wishlist.items.push({
      product: req.body.productId,
    });
  }

  await wishlist.save();

  sendResponse(
    res,
    200,
    wishlist,
    `${product.name} has been successfully added to your wishllist`
  );
});

export const getWishlist = catchAsync(async (req, res, next) => {
  const wishlists = await Wishlist.findOne({
    user: req.user.id,
  }).populate('items.product');

  sendResponse(res, 200, wishlists);
});

export const removeFromWishlist = catchAsync(
  async (req, res, next) => {
    const wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      return next(new AppError('Wishlist not found', 404));
    }

    const item = wishlist.items.find(
      (item) => item.product.toString() === req.params.productId
    );

    if (!item) {
      return next(
        new AppError('Product not found in your wishlist', 404)
      );
    }

    wishlist.items.pull(item._id);

    await wishlist.save();

    sendResponse(res, 200, wishlist, 'Wishlist removed successfully');
  }
);
