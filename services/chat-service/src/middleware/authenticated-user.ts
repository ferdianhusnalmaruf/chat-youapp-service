import { HttpError, USER_ID_HEADER, z } from '@chat-youapp/common';
import type { RequestHandler } from 'express';

const userIdSchema = z.string().uuid();

export const authenticatedUserMiddleware: RequestHandler = (req, res, next) => {
  try {
    const headerUserId = req.header(USER_ID_HEADER);
    const userId = userIdSchema.parse(headerUserId);
    req.user = { id: userId };
    next();
  } catch (error) {
    next(new HttpError(401, 'Invalid or missing user context'));
  }
};
