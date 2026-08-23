import type { Request, Response, NextFunction } from 'express';
import type { ZodType } from 'zod';
import AppError from './AppError';

export const validate = (
  schema: ZodType,
  source: 'body' | 'params' | 'query' = 'body'
) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const data =
      source === 'body'
        ? req.body
        : source === 'params'
          ? req.params
          : req.query;

    const result = schema.safeParse(data);

    if (!result.success) {
      const formattedErrors = result.error.issues.map((issue) => ({
        field: issue.path.join('.') || 'body',
        message: issue.message,
      }));

      return next(
        new AppError('Validation failed', 422, formattedErrors)
      );
    }

    if (source === 'body') {
      result.data = req.body;
    } else {
      Object.assign(
        source === 'params' ? req.params : req.query,
        result.data
      );
    }
    next();
  };
};

// import type { Request, Response, NextFunction } from 'express';
// import type { ZodType } from 'zod';
// import AppError from './AppError';

// export const validate = (
//   schema: ZodType,
//   source: 'body' | 'params' | 'query' | 'file' = 'body'
// ) => {
//   return (req: Request, res: Response, next: NextFunction) => {
//     let data;

//     if (source === 'file') {
//       data = req.files?.length ? req.files : req.file;

//       if (!data) return next();
//     } else {
//       data = req[source] || {};
//     }

//     const result = schema.safeParse(data);

//     if (!result.success) {
//       return next(
//         new AppError(
//           result.error.issues.map((issue) => issue.message).join(', '),
//           400
//         )
//       );
//     }

//     if (source === 'body') {
//       req.body = result.data;
//     }

//     next();
//   };
// };
