import expres from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
dotenv.config({ path: './Config/config.env', quiet: true });
import globalErrorHandler from './Controller/errorController.js';
import AppError from './Utils/appError.js';
import authRouter from './Router/userRouter.js';
import productRouter from './Router/productRouter.js';
import orderRouter from './Router/orderRouter.js';
import dashboardRouter from './Router/dashboardRouter.js';

const app = expres();
app.set('query parser', 'extended');

app.use(expres.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use((req, res, next) => {
  next();
});

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
