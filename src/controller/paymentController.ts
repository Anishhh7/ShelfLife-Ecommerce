import catchAsync from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';
import * as paymentService from '../service/paymentService';
import AppError from '../utils/AppError';
import { logger } from '../lib/logger';

export const createCheckoutSession = catchAsync(async (req, res) => {
  const userId = Number(req.user?.id);
  const { orderId, provider } = req.body;

    logger.info(
  {
    userId: userId,
    orderId: orderId,
    provider,
  },
  'Creating Stripe checkout session'
);

  const payment = await paymentService.createCheckOutSession(
    userId,
    orderId,
    provider
  );


  sendResponse(
    res,
    200,
    payment,
    'Checkout session created successfully'
  );
});

export const stripeWebhook = catchAsync(async (req, res, next) => {
    const signature = req.headers['stripe-signature'];

    if (!signature || Array.isArray(signature)) {
        return next (new AppError('Stripe signature is missing', 400))
    }
    await paymentService.handleStripeWebhook(req.body, signature)

    return res.status(200).json({
        status:'success'
    })
})