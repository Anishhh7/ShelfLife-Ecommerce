import compression from 'compression';
import type {
  Application,
  NextFunction,
  Request,
  Response,
} from 'express';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import './config/redis';
import { protect } from './controller/authController';
import globalErrorHandler from './controller/errorController';
import { stripeWebhook } from './controller/paymentController';
import './queue/email.worker';
import addressRouter from './Router/addressRouter';
import administrationRouter from './Router/administrationRouter';
import authRouter from './Router/authRouter';
import cartRouter from './Router/cartRouter';
import categoryRouter from './Router/categoryRouter';
import orderRouter from './Router/orderRouter';
import paymentRouter from './Router/paymentRouter';
import productRouter from './Router/productRouter';
import reviewRouter from './Router/reviewRouter';
import wishlistRouter from './Router/wishlistRouter';
import AppError from './utils/AppError';

const app: Application = express();
app.set('query parser', 'extended');

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https:'],
        imgSrc: ["'self'", 'data:', 'https:'],
        fontSrc: ["'self'", 'https:', 'data:'],
        connectSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

app.use(compression());

app.post(
  '/api/v1/payments/stripe/webhook',
  express.raw({ type: 'application/json' }),
  stripeWebhook
);

app.use(express.json());

app.use('/api/v1/payment', protect, paymentRouter);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/administrations', administrationRouter);
app.use('/api/v1/addresses', addressRouter);
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/carts', cartRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/wishlists', wishlistRouter);

app.all(
  '/{*path}',
  (req: Request, res: Response, next: NextFunction) => {
    next(
      new AppError(
        `Route ${req.method} ${req.originalUrl} does not exist`,
        404
      )
    );
  }
);

app.use(globalErrorHandler);

export default app;
