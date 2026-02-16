import { env } from '@/config/env';
import { AuthenticationUser, HttpError } from '@chat-youapp/common';
import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

interface AccessTokenClaims {
  sub: string;
  email?: string;
}

const parseAuthorizationHeader = (value: string | undefined): string => {
  if (!value) {
    throw new HttpError(401, 'Unauthorized');
  }

  const [scheme, token] = value.split(' ');

  if (scheme.toLowerCase() !== 'bearer' || !token) {
    throw new HttpError(401, 'Unauthorized');
  }

  return token;
};

const toAuthenticationUser = (claims: AccessTokenClaims): AuthenticationUser => {
  if (!claims.sub) {
    throw new HttpError(401, 'Unauthorized');
  }

  return {
    id: claims.sub,
    email: claims.email,
  };
};

export const requireAuth: RequestHandler = (req, _res, next) => {
  try {
    const token = parseAuthorizationHeader(req.headers.authorization);
    const claims = jwt.verify(token, env.JWT_SECRET) as AccessTokenClaims;

    req.user = toAuthenticationUser(claims);
    next();
  } catch (error) {
    if (error instanceof HttpError) {
      next(error);
      return;
    }

    next(new HttpError(401, 'Unauthorized'));
  }
};
