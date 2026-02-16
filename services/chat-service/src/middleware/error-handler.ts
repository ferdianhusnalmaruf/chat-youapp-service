import type { ErrorRequestHandler } from 'express';

import { logger } from '@/utils/logger';
import { HttpError } from '@chat-youapp/common';

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  logger.error({ err }, 'Unhandled error occured');

  const error = err instanceof HttpError ? err : undefined;
  const statusCode = error?.statusCode ?? 500;
  const message =
    statusCode >= 500 ? 'Internal server error' : (error?.message ?? 'Internal error');
  const payload = error?.details ? { message, details: error.details } : { message };

  res.status(statusCode).json(payload);

  void _next();
};
