import { createUserHandler, getUserHandler } from '@/controllers/user.controller';
import { requireAuth } from '@/middleware/require-auth';
import { createUserSchema, userIdpParamsSchema } from '@/validation/user.schema';
import { asyncHandler, validateRequest } from '@chat-youapp/common';
import { Router } from 'express';

export const userRouter: Router = Router();

userRouter.get(
  '/:id',
  requireAuth,
  validateRequest({ params: userIdpParamsSchema }),
  asyncHandler(getUserHandler),
);
userRouter.post(
  '/',
  requireAuth,
  validateRequest({ body: createUserSchema }),
  asyncHandler(createUserHandler),
);
