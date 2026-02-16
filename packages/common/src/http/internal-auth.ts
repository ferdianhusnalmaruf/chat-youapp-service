import { RequestHandler } from 'express';
import { HttpError } from '../errors/http-error';

export interface InternalAuthOptions {
  headerName?: string;
  exemptPaths?: string[];
}

const DEFAULT_HEADER_NAME = 'x-internal-token';

export const createInternalAuthMiddleware = (
  expectedToken: string,
  options: InternalAuthOptions = {},
): RequestHandler => {
  const headerOptions = options.headerName?.toLowerCase();
  const headerName = headerOptions ?? DEFAULT_HEADER_NAME;
  const exemptPaths = new Set(options.exemptPaths ?? []);

  return (req, _res, next) => {
    if (exemptPaths.has(req.path)) {
      next();
      return;
    }

    const headers = req.headers;

    const provided = headers[headerName];

    const token = Array.isArray(provided) ? provided[0] : provided;

    console.error('=== INTERNAL TOKEN ERROR ===');
    console.log('Internal Auth Middleware initialized with exempt paths:', Array.from(exemptPaths));
    console.log('Header request :', headers);
    console.log('Header options :', headerOptions);
    console.log('Header name:', headerName);

    console.log('Provided token:', provided);
    console.log('Expected token:', expectedToken);
    console.log('Request token:', token);
    console.error('========================');

    if (typeof token !== 'string' || token !== expectedToken) {
      next(new HttpError(401, 'Unauthorized'));
      return;
    }

    console.log('Auth successfully');
    next();
  };
};
