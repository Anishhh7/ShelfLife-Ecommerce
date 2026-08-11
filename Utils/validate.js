import AppError from './appError.js';

export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const data = req[source];

    const result = schema.safeParse(data);

    if (!result.success) {
      return next(
        new AppError(
          result.error.issues
            .map((issue) => issue.message)
            .join(', '),
          400
        )
      );
    }
    if (source !== 'file') {
      req[source] = result.data;
    }
    next();
  };
};
