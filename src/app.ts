import express from 'express';
import type { Application } from 'express';
import type { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import globalErrorHandler from './controller/errorController';
import AppError from './utils/AppError';
import authRouter from './Router/authRouter';
import administrationRouter from './Router/administrationRouter';
import addressRouter from './Router/addressRouter';
import categoryRouter from './Router/categoryRouter';
import productRouter from './Router/productRouter';
import cartRouter from './Router/cartRouter';

const app: Application = express();
app.set('query parser', 'extended');

app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/administrations', administrationRouter);
app.use('/api/v1/addresses', addressRouter);
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/carts', cartRouter);

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
