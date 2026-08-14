import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
import AppError from './AppError';

export const validate = (
  schema: ZodSchema,
  source: 'body' | 'params' | 'query' = 'body'
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    let data;

    if (source === 'body') {
      data = req.body;
    } else if (source === 'params') {
      data = req.params;
    } else {
      data = req.query;
    }

    const result = schema.safeParse(data);

    if (!result.success) {
      const formattedErrors = result.error.issues.map((issue) => ({
        field: issue.path.join('.') || 'body',
        message: issue.message,
      }));

      return next(
        new AppError('Validation failed', 400, formattedErrors)
      );
    }

    if (source === 'body') {
      result.data = req.body;
    } else if (source === 'params') {
      result.data = req.params;
    } else {
      result.data = req.query;
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
