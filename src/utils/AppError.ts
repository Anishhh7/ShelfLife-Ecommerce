class AppError extends Error {
  statusCode: number;
  status: string;
  errors: unknown | null;
  isOperational: boolean;
    code?: string | number | undefined;

  constructor(message: string, statusCode: number, errors = null) {
    super(message);

    this.statusCode = statusCode;

    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    this.errors = errors;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
