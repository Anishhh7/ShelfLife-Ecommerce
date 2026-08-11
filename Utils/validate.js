import AppError from './appError.js';

export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    let data;

    if (source === 'file') {
      data = req.files?.length ? req.files : req.file;

      if (!data) return next();
    } else {
      data = req[source] || {};
    }

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

    if (source === 'body') {
      req.body = result.data;
    }

    next();
  };
};