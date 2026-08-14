import AppError from '../utils/AppError';
import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '../generated/prisma/client';

const handleDuplicateFiledDB = (error: any) => {
  const fields = error.meta?.target;

  const field = Array.isArray(fields) ? fields.join(', ') : 'field';
  return new AppError(`Duplicate value for ${field}`, 409);
};

const handleZodError = (err: ZodError) => {
  const errors = err.issues.map((issue) => ({
    field: issue.path.join(', '),
    message: issue.message,
  }));

  return new AppError('Validation failed', 400, errors);
};

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
  console.error('Error Caught by Global Handler:', err);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (err instanceof ZodError) {
    err = handleZodError(err);
  }

  if (err?.code === 'P2002') {
    err = handleDuplicateFiledDB(err);
  }
  // src/controller/errorController.ts
  if (err instanceof SyntaxError && 'body' in err) {
    err = new AppError('Invalid JSON payload in request body', 400);
  }

  if (process.env.NODE_ENV === 'development') {
    return sendErrorDev(err, res);
  }
  return sendErrorProd(err, res);
};
