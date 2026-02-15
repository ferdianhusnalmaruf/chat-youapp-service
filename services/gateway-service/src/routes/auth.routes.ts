import {
  loginUserHandler,
  refreshTokenHandler,
  registerUserHandler,
  revokeTokenHandler,
} from '@/controllers/auth.controller';
import { loginSchema, refreshSchema, registerSchema, revokeSchema } from '@/validation/auth.schema';
import { asyncHandler, validateRequest } from '@chat-youapp/common';
import { Router } from 'express';

export const authRouter: Router = Router();

authRouter.post(
  '/register',
  validateRequest({ body: registerSchema }),
  asyncHandler(registerUserHandler),
);
authRouter.post('/login', validateRequest({ body: loginSchema }), asyncHandler(loginUserHandler));
authRouter.post(
  '/refresh',
  validateRequest({ body: refreshSchema }),
  asyncHandler(refreshTokenHandler),
);
authRouter.post(
  '/revoke',
  validateRequest({ body: revokeSchema }),
  asyncHandler(revokeTokenHandler),
);
