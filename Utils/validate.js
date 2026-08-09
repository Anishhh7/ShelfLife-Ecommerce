import AppError from './appError.js';

export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      return next(new AppError(result.error.issues[0].message, 400));
    }

    req.body = result.data;
    next();
  };
};
