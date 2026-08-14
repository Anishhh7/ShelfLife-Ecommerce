import type { Request, Response, NextFunction } from 'express';
import type { ZodType } from 'zod';

export const validate = (
  schema: ZodType,
  source: 'body' | 'params' | 'query' = 'body'
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    let data;

    if (source === 'body') {
      data = req.body;
    } else if (source === 'params') {
      data = req.params;
    } else source === 'query';
    {
      data = req.query;
    }

    const result = schema.safeParse(data);

    if (!result.success) {
      return next(result.error);
    }

    if (source === 'body') req.body = result.data;
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
