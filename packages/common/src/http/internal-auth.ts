import { RequestHandler } from 'express';
import { HttpError } from '../errors/http-error';

export interface InternalAuthOptions {
  headerName?: string;
  exemptPaths?: string[];
}

const DEFAULT_HEADER_NAME = 'x-internal-token';

// export const createInternalAuthMiddleware = (
//   expectedToken: string,
//   options: InternalAuthOptions = {},
// ): RequestHandler => {
//   const headerName = options.headerName?.toLowerCase() ?? DEFAULT_HEADER_NAME;
//   const exemptPaths = new Set(options.exemptPaths ?? []);

//   return (req, _res, next) => {
//     if (exemptPaths.has(req.path)) {
//       next();
//       return;
//     }

//     const provided = req.headers[headerName];

//     const token = Array.isArray(provided) ? provided[0] : provided;

//     if (typeof token !== 'string' || token !== expectedToken) {
//       next(new HttpError(401, 'Unauthorized'));
//       return;
//     }

//     next();
//   };
// };

export const createInternalAuthMiddleware = (
  expectedToken: string,
  options: InternalAuthOptions = {},
): RequestHandler => {
  const headerName = options.headerName?.toLowerCase() ?? DEFAULT_HEADER_NAME;
  const exemptPaths = new Set(options.exemptPaths ?? []);

  return (req, _res, next) => {
    if (exemptPaths.has(req.path)) {
      next();
      return;
    }

    const provided = req.headers[headerName];
    console.error('=== INTERNAL TOKEN ERROR ===');
    console.log('Internal Auth Middleware initialized with exempt paths:', Array.from(exemptPaths));
    console.log('Provided token:', provided);
    console.log('Expected token:', expectedToken);
    console.error('========================');

    const token = Array.isArray(provided) ? provided[0] : provided;

    if (typeof token !== 'string' || token !== expectedToken) {
      next(new HttpError(401, 'Unauthorized'));
      return;
    }

    console.log('Auth successful');
    next();
  };
};
