import Stripe from 'stripe';
import { stripe } from '../config/stripe';
import { logger } from '../lib/logger';
import prisma from '../lib/prisma';
import AppError from '../utils/AppError';

export const createCheckOutSession = async (
  userId: number,
  orderId: number,
  provider: string
): Promise<{
  sessionId: string;
  checkoutUrl: string | null;
}> => {
  if (provider !== 'stripe') {
    throw new AppError('Only Stripe payments are supported', 400);
  }

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
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

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (order.paymentStatus === 'Paid') {
    throw new AppError('Order is already paid', 400);
  }

  const lineItems = order.items.map((item) => ({
    price_data: {
      currency: 'npr',
      product_data: {
        name: item.productName,
      },
      unit_amount: Math.round(Number(item.price) * 100),
    },
    quantity: item.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems,
    metadata: {
      orderId: order.id.toString(),
      userId: userId.toString(),
    },
    success_url: 'https://example.com/payment/success',
    cancel_url: 'https://example.com/payment/cancel',
  });

  await prisma.payment.create({
    data: {
      userId,
      orderId: order.id,
      paymentId: session.id,
      provider: 'stripe',
      method: 'CreditCard',
      amount: order.totalAmount,
    },
  });

  return {
    sessionId: session.id,
    checkoutUrl: session.url,
  };
};

export const handleStripeWebhook = async (
  rawBody: Buffer,
  signature: string
) => {
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    logger.error(
      { error },
      'Stripe webhook signature verification failed'
    );
    throw new AppError('Invalid Stripe webhook signature', 400);
  }

  logger.info(
    {
      eventId: event.id,
      eventType: event.type,
    },
    'Stripe webhook received'
  );

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;

      const orderId = Number(session.metadata?.orderId);

      if (!orderId) {
        logger.warn(
          { sessionId: session.id },
          'Stripe session has no orderId'
        );
        return;
      }

      const payment = await prisma.payment.findFirst({
        where: {
          provider: 'stripe',
          paymentId: session.id,
        },
      });

      if (!payment) {
        logger.warn(
          {
            sessionId: session.id,
            orderId,
          },
          'Payment record not found'
        );
        return;
      }

      await prisma.$transaction([
        prisma.payment.update({
          where: {
            id: payment.id,
          },
          data: {
            status: 'Paid',
          },
        }),

        prisma.order.update({
          where: {
            id: orderId,
          },
          data: {
            paymentStatus: 'Paid',
            paymentMethod: 'CreditCard',
          },
        }),
      ]);

      logger.info(
        {
          orderId,
          paymentId: payment.id,
          sessionId: session.id,
        },
        'Stripe payment completed successfully'
      );

      break;
    }

    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session;

      logger.info(
        {
          sessionId: session.id,
        },
        'Stripe checkout session expired'
      );

      break;
    }

    default:
      logger.info(
        {
          eventType: event.type,
        },
        'Unhandled Stripe webhook event'
      );
  }
};
