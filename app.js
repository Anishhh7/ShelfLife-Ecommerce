import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
dotenv.config({ path: './Config/config.env', quiet: true });
import cookieParser from 'cookie-parser';
import ExpressMongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';
import globalErrorHandler from './Controller/errorController.js';
import AppError from './Utils/appError.js';
import authRouter from './Router/userRouter.js';
import productRouter from './Router/productRouter.js';
import orderRouter from './Router/orderRouter.js';
import dashboardRouter from './Router/dashboardRouter.js';

const app = express();
app.set('query parser', 'extended');

app.use(helmet());

app.use(express.json());
app.use(cookieParser());


app.use(ExpressMongoSanitize);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/dashboards', dashboardRouter);

app.all('/{*path}', (req, res, next) => {
  next(
    new AppError(`Can't find ${req.originalUrl} on this server`, 404)
  );
});

app.use(globalErrorHandler);

export default app;
