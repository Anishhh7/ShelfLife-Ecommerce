import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '../generated/prisma/client';
import AppError from '../utils/AppError';
import { logger } from '../lib/logger';

/* ─────────────── converters: library error → AppError ─────────────── */

const handleZodError = (err: ZodError): AppError => {
  const errors = err.issues.map((issue) => ({
    field: issue.path.join('.') || '(root)',
    message: issue.message,
  }));

  return new AppError('Validation failed', 422, errors);
};

const handlePrismaKnownError = (
  err: Prisma.PrismaClientKnownRequestError
): AppError => {
  switch (err.code) {
    case 'P2002': {
      const target = err.meta?.target;
      const field = Array.isArray(target)
        ? target.join(', ')
        : typeof target === 'string'
          ? target
          : 'field';
      return new AppError(
        `A record with this ${field} already exists.`,
        409
      );
    }

    case 'P2025': // record required by the operation was not found
    case 'P2001': // record searched for in the where clause does not exist
    case 'P2015': // related record not found
      return new AppError('Record not found.', 404);

    case 'P2003': // foreign key constraint failed
    case 'P2014': // change would violate a required relation
      return new AppError(
        'Invalid reference ID (foreign key constraint failed).',
        409
      );

    case 'P2000': // value too long for the column
      return new AppError('A field value is too long.', 400);

    case 'P2011': // null constraint violation
    case 'P2012': // missing required value
      return new AppError('A required field is missing.', 400);

    case 'P2020': // value out of range
    case 'P2033': // number too large for a 64-bit int
      return new AppError('A field value is out of range.', 400);

    case 'P2034': // write conflict / deadlock — safe to retry
      return new AppError(
        'Write conflict, please retry the request.',
        409
      );

    case 'P1001': // cannot reach the database
    case 'P1002': // connection timed out
    case 'P1017': // server closed the connection
    case 'P2024': // connection pool exhausted
      return new AppError(
        'Database is unavailable, please try again.',
        503
      );

    case 'P2021': // table does not exist
    case 'P2022': // column does not exist
      // Migrations did not run. Our bug, not the client's.
      return new AppError(
        'Database schema error.',
        500,
        undefined,
        false
      );

    default:
      // Unknown Prisma code → assume our fault, never blame the client.
      return new AppError(
        'Database request failed.',
        500,
        undefined,
        false
      );
  }
};

const handlePrismaValidationError = (): AppError =>
  // Wrong arguments passed to a Prisma query — usually a developer bug,
  // returned as 400 so the client does not retry it forever.
  new AppError(
    'Invalid data sent to the database query.',
    400,
    undefined,
    false
  );

const handlePrismaInitError = (): AppError =>
  new AppError(
    'Database is unavailable, please try again.',
    503,
    undefined,
    false
  );

/* ─────────────── normalizer: anything → AppError ─────────────── */

const toAppError = (err: any): AppError => {
  if (err instanceof AppError) return err;

  if (err instanceof ZodError) return handleZodError(err);

  if (err instanceof Prisma.PrismaClientKnownRequestError)
    return handlePrismaKnownError(err);

  if (err instanceof Prisma.PrismaClientValidationError)
    return handlePrismaValidationError();

  if (err instanceof Prisma.PrismaClientInitializationError)
    return handlePrismaInitError();

  // express.json() failures — these are thrown before your code runs
  if (err instanceof SyntaxError && 'body' in err)
    return new AppError('Invalid JSON payload in request body', 400);

  if (err?.type === 'entity.too.large')
    return new AppError('Request body is too large', 413);

  // jsonwebtoken
  if (err?.name === 'TokenExpiredError')
    return new AppError(
      'Your session has expired, please log in again.',
      401
    );

  if (err?.name === 'JsonWebTokenError')
    return new AppError('Invalid token, please log in again.', 401);

  // Anything left is an unknown programming error.
  return new AppError(
    err?.message || 'Something went very wrong',
    err?.statusCode || err?.status || 500,
    undefined,
    false
  );
};

/* ─────────────── responses ─────────────── */

const sendErrorDev = (err: AppError, res: Response): void => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    ...(err.errors != null && { errors: err.errors }),
    error: err,
    stack: err.stack,
  });
};

const sendErrorProd = (err: AppError, res: Response): void => {
  // Operational: safe to show the real message.
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      ...(err.errors != null && { errors: err.errors }),
    });
    return;
  }

  // Programming / unknown error: never leak details.
  res.status(500).json({
    status: 'error',
    message: 'Something went very wrong',
  });
};

/* ─────────────── global error middleware ─────────────── */

export default (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = toAppError(err);

  // Log ONCE, at a level that matches severity.
  const meta = {
    method: req.method,
    url: req.originalUrl,
    statusCode: error.statusCode,
    isOperational: error.isOperational,
    ip: req.ip,
  };

  if (error.statusCode >= 500)
    logger.error({ ...meta, err }, error.message);
  else logger.warn(meta, error.message);

  // Response already started streaming — we cannot change the status code.
  if (res.headersSent) {
    next(err);
    return;
  }

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
    return;
  }

  sendErrorProd(error, res);
};
