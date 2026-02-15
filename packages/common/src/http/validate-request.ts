import { z } from 'zod';

import { HttpError } from '../errors/http-error';

import type { NextFunction, Request, Response } from 'express';
import { AnyZodObject, ZodError, ZodTypeAny } from 'zod';

type Schema = AnyZodObject | ZodTypeAny;
type ParamsRecord = Record<string, string>;
type QueryRecord = Record<string, unknown>;

export interface RequestValidationSchemas {
  body?: Schema;
  params?: Schema;
  query?: Schema;
}

export const formatedError = (error: ZodError) => {
  return error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code,
  }));
};

export const validateRequest = (schemas: RequestValidationSchemas) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        const parsedBody = schemas.body.parse(req.body) as unknown;
        req.body = parsedBody;
      }

      if (schemas.params) {
        const parsedParam = schemas.params.parse(req.params) as ParamsRecord;
        req.params = parsedParam as Request['params'];
      }

      if (schemas.query) {
        const parsedQuery = schemas.query.parse(req.query) as QueryRecord;
        req.query = parsedQuery as Request['query'];
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        console.error('=== VALIDATION ERROR ===');
        console.error('Request body:', JSON.stringify(req.body, null, 2));
        console.error('Raw ZodError:', error); // ← Tambahkan ini
        console.error('ZodError.errors:', error.errors); // ← Tambahkan ini

        const issues = formatedError(error);
        console.error('Validation issues:', JSON.stringify(issues, null, 2));
        console.error('========================');

        next(
          new HttpError(422, 'Failed validation', {
            issues,
          }),
        );
        return;
      }
      next(error);
    }
  };
};
