import { AuthenticationUser, HttpError } from '@chat-youapp/common';
import { Request } from 'express';

export const getAutheticationUser = (req: Request): AuthenticationUser => {
  if (!req.user) {
    throw new HttpError(401, 'Unauthorized');
  }

  return req.user;
};
