import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export const validateRequest = (schema: {
  body?: AnyZodObject;
  query?: AnyZodObject;
  params?: AnyZodObject;
}) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }
      if (schema.query) {
        req.query = await schema.query.parseAsync(req.query);
      }
      if (schema.params) {
        req.params = await schema.params.parseAsync(req.params);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message
        }));

        const detailedMsg = issues.map(i => (i.field ? `${i.field}: ${i.message}` : i.message)).join('; ');

        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: detailedMsg || 'Invalid request parameters',
            details: issues
          }
        });
        return;
      }

      res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Failed to process request data'
        }
      });
    }
  };
};
