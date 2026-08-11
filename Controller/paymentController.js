import catchAsync from '../Utils/catchAsync.js';
import AppError from '../Utils/appError.js';
import sendResponse from '../Utils/sendResponse.js';
import Payment from '../Model/paymentModel.js';
import Order from '../Model/orderModel.js';
import stripe from '../Config/stripe.js';

export const createCheckoutSession = catchAsync(
  async (req, res, next) => {
    const { order: orderId, provider, method } = req.body;

    if (provider !== 'stripe') {
      return next(
        new AppError('Only Stripe payments are supported', 400)
      );
    }

    const order = await Order.findOne({
      _id: orderId,
      user: req.user.id,
    });

    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    const existingPayment = await Payment.findOne({
      order: order._id,
      status: 'Pending',
    });

    if (existingPayment) {
      if (existingPayment.stripeSessionId) {
        const session = await stripe.checkout.sessions.retrieve(
          existingPayment.stripeSessionId
        );

        return res.status(200).json({
          status: 'success',
          message: 'Payment session already pending',
          url: session.url,
        });
      }
    }

    if (order.paymentStatus === 'Paid') {
      return next(new AppError('Order has already been paid', 400));
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],

      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `ShelfLife Order ${order._id}`,
            },
            unit_amount: Math.round(order.totalAmount * 100),
          },
          quantity: 1,
        },
      ],

      success_url: `${process.env.CLIENT_URL}/order-success?session_id={CHECKOUT_SESSION_ID}`,

      cancel_url: `${process.env.CLIENT_URL}/payment-cancelled`,

      metadata: {
        orderId: order._id.toString(),
        userId: req.user.id.toString(),
      },
    });

    const payment = await Payment.findOneAndUpdate(
      { order: orderId },
      {
        user: req.user.id,
        order: order._id,
        paymentId: session.id,
        provider: 'stripe',
        method: 'Credit-card',
        amount: order.totalAmount,
        status: 'Pending',
        checkoutUrl: session.url,
      },
      { new: true, upsert: true }
    );

    sendResponse(
      res,
      201,
      {
        paymentId: payment._id,
        stripeSessionId: session.id,
        checkoutUrl: session.url,
        amount: order.totalAmount,
        status: payment.status,
      },
      'Checkout session created successfully'
    );
  }
);


export const stripeWebHook = async (req, res) => {
  const signature = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error(
      'Stripe webhook signature verification failed:',
      error.message
    );

    return res.status(400).json({
      status: 'fail',
      message: `Webhook Error: ${error.message}`,
    });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;

        const payment = await Payment.findOne({
          paymentId: session.id,
        });

        console.log('Stripe session:', session.id);
        console.log('Payment found:', payment?._id);

        if (!payment) {
          return res.status(404).json({
            status: 'fail',
            message: 'Payment record not found',
          });
        }

        if (payment.status === 'Completed') {
          return res.status(200).json({
            status: 'success',
            message: 'Payment already processed',
          });
        }

        payment.status = 'Completed';
        await payment.save();

        await Order.findByIdAndUpdate(payment.order, {
          paymentStatus: 'Paid',
        });

        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;

        await Payment.findOneAndUpdate(
          { paymentId: paymentIntent.id },
          { status: 'Cancelled' }
        );

        break;
      }

      default:
        console.log(`Unhandled Stripe event: ${event.type}`);
    }
    return res.status(200).json({
      status: 'success',
      message: 'Webhook received successfully',
    });
  } catch (error) {
    console.error('Stripe webhook processing failed:', error);

    return res.status(500).json({
      status: 'fail',
      message: 'Webhook processing failed',
    });
  }
};

