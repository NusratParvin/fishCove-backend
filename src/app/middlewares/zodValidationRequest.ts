import { NextFunction, Request, Response } from 'express';
import { AnyZodObject } from 'zod';

const zodValidationRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsedBody = await schema.parseAsync(req.body);
      req.body = parsedBody;
      next();
    } catch (err) {
      next(err);
    }
  };
};

export default zodValidationRequest;
