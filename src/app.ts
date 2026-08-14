import express from 'express';
import type { Application } from 'express';
import type { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import globalErrorHandler from './controller/errorController';
import AppError from './utils/AppError';
import authRouter from './Router/authRouter';

const app: Application = express();
app.set('query parser', 'extended');

app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api/v1/auth', authRouter);

app.all(
  '/{*path}',
  (req: Request, res: Response, next: NextFunction) => {
    next(
      new AppError(
        `Can't find ${req.originalUrl} on this server`,
        404
      )
    );
  }
);

app.use(globalErrorHandler);

export default app;
