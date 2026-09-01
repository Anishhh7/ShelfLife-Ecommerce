import catchAsync from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';
import * as wishlistService from '../service/wishlistService';

export const addToWishlist = catchAsync(async (req, res) => {
  const userId = Number(req.user?.id);
  const { productId } = req.body;

  const wishlist = await wishlistService.addToWishlist(
    userId,
    productId
  );
  if (wishlist.action === 'created') {
    return sendResponse(
      res,
      201,
      wishlist.wishlist,
      'Wishlist has been created successfully'
    );
  }

  return sendResponse(
    res,
    200,
    wishlist.wishlist,
    'Added item to your wishlist'
  );
});

export const removeFromWishlist = catchAsync(async (req, res) => {
  const userId = Number(req.user?.id);
  const productId  = Number(req.params.productId)

  await wishlistService.removeFromWishlist(userId, productId);

  sendResponse(res, 200, null);
});

export const getAllMyWishlist = catchAsync(async (req, res) => {
  const userId = Number(req.user?.id);

  const wishlist = await wishlistService.getAllWishlists(userId);

  sendResponse(res, 200, wishlist);
});
