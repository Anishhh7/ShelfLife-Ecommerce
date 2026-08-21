import catchAsync from '../utils/catchAsync';
import {sendResponse} from '../utils/sendResponse';
import * as cartService from '../service/cartService';
import prisma from '../config/prisma';

export const addToCart = catchAsync(async (req, res, next) => {
  const { productId, quantity } = req.body;
  const userId = Number(req.user?.id);

  const cart = await cartService.addToCart(
    userId,
    Number(productId),
    quantity
  );

  if (cart.action === 'created') {
    return sendResponse(
      res,
      201,
      cart.cart,
      'Cart has been created successfully'
    );
  }

  return sendResponse(
    res,
    200,
    cart.cart,
    'Cart updated successfully'
  );
});

export const updateCart = catchAsync(async (req, res, next) => {
  const { quantity } = req.body;
  const userId = Number(req.user?.id);
  const {itemId}= req.params

  const cart = await cartService.updateCartItem(
    userId,
    quantity,
    Number(itemId)
  );

  sendResponse(res, 200, cart, 'Cart updated successfully');
});

export const removeItemsFromCart = catchAsync(
  async (req, res, next) => {
    const userId = Number(req.user?.id);
    const { itemsIds } = req.body;

    const cart = await cartService.removeItemsFromCart(
      userId,
      itemsIds
    );

    sendResponse(
      res,
      200,
      cart,
      'Item has been removed successfully'
    );
  }
);

export const getCart = catchAsync(async (req, res, next) => {
  const userId = Number(req.user?.id);

  const cart = await prisma.cart.findMany({
    where: {
      userId,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  sendResponse(res, 200, cart);
});
