import AppError from '../utils/AppError';
import type { Request, Response, NextFunction } from 'express';

const sendErrorDev = (err: AppError, res: Response) => {
  res.status(err.statusCode).json({
    status: err.status || 'error',
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err: AppError, res: Response) => {
  ////////// Operational Error message to client/////////////////
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      ...(err.errors != null && { errors: err.errors }),
    });
  }

  ////////Unknown Programming Errors///////////
  console.error('Error: ', err);

  res.status(500).json({
    status: 'error',
    message: 'Something went very wrong',
  });
};

////////////Global Error Middleware////////////////

export default (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  console.error('Error Caught by Global Handler:', err);

  if (process.env.NODE_ENV === 'development') {
    return sendErrorDev(err, res);
  }

  if (process.env.NODE_ENV === 'production') {
    let error: AppError = Object.create(err);

    error.message = err.message;
    error.name = err.name;
    error.isOperational = err.isOperational || false;
    error.statusCode = err.statusCode;
    err.status = err.status;

    if (err.code !== undefined) error.code = err.code;

    if (err.errors !== undefined) error.errors = err.errors;

    return sendErrorProd(error, res);
  }
  return sendErrorDev(err, res);
};
