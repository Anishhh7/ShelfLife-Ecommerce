import AppError from '../utils/appError.js';

const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldDB = (err) => {
  let actualValue = 'Unknown';

  if (err.keyValue) {
    actualValue = Object.values(err.keyValue)[0];
  } else if (err.errResponse && err.errResponse.keyValue) {
    actualValue = Object.values(err.errResponse.keyValue)[0];
  }

  const message = `Duplicate field value: '${actualValue}'. Please use another value.`;
  return new AppError(message, 400);
};

const handleValidatorErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleZodError = (err) => {
  const errors = err.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));

  return new AppError('Validation failed', 400, errors);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again.', 401);

const handleJWTExpiredError = () =>
  new AppError('Your session has expired. Please log in again.', 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      ...(err.errors && { errors: err.errors }),
    });
  }
  // Unknown/programming error

  res.status(500).json({
    status: 'error',
    message: 'Something went very wrong',
  });
};

export default (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  console.error('Error caught by GLOBAL HANDLER:', err);

  if (process.env.NODE_ENV === 'development') {
    return sendErrorDev(err, res);
  }

  if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;
    error.name = err.name;
    error.code = err.code;
    error.errors = err.errors;
    error.keyValue = err.keyValue;
    error.errResponse = err.errResponse;
    error.isOperational = err.isOperational;
    error.statusCode = err.statusCode;
    error.status = err.status;

    if (error.name === 'CastError') error = handleCastError(error);
    if (error.code === 11000) error = handleDuplicateFieldDB(error);
    if (error.name === 'ValidationError')
      error = handleValidatorErrorDB(error);
    if (err instanceof ZodError) error = handleZodError(err);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError')
      error = handleJWTExpiredError();

    return sendErrorProd(error, res);
  }

  return sendErrorDev(err, res);
};
