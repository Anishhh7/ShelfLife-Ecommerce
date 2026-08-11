import express from 'express';
import { stripeWebHook } from './Controller/paymentController.js';
import morgan from 'morgan';
import dotenv from 'dotenv';
dotenv.config({ path: './Config/config.env', quiet: true });
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import hpp from 'hpp';
import globalErrorHandler from './Controller/errorController.js';
import AppError from './Utils/appError.js';
import authRouter from './Router/userRouter.js';
import adminstrationRouter from './Router/administarionRouter.js';
import productRouter from './Router/productRouter.js';
import cartRouter from './Router/cartRouter.js';
import orderRouter from './Router/orderRouter.js';
import dashboardRouter from './Router/dashboardRouter.js';
import reviewRouter from './Router/reviewRouter.js';
import wishlistRouter from './Router/wishlistRouter.js';
import addressBookRouter from './Router/addressBookRouter.js';
import categoryRouter from './Router/categoryRouter.js';
import vendorRouter from './Router/vendorRouter.js';
import paymentRouter from './Router/paymentRouter.js';

const app = express();
app.set('query parser', 'extended');

app.use(
  '/api/v1/payments/webhook',
  express.raw({ type: 'application/json' }),
  stripeWebHook
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(cookieParser());

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message:
    'Too many requests from this IP, Please try again in an hour',
});

app.use('/api', limiter);

app.use(hpp());

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/admin', adminstrationRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/dashboards', dashboardRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/wishlists', wishlistRouter);
app.use('/api/v1/addresses', addressBookRouter);
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/vendors', vendorRouter);
app.use('/api/v1/payments', paymentRouter);

app.all('/{*path}', (req, res, next) => {
  next(
    new AppError(`Can't find ${req.originalUrl} on this server`, 404)
  );
});

app.use(globalErrorHandler);

export default app;
