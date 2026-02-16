import { createUserHandler, getUserHandler } from '@/controllers/user.controller';
import { createUserSchema, userIdpParamsSchema } from '@/validation/user.schema';
import { asyncHandler, validateRequest } from '@chat-youapp/common';
import { Router } from 'express';

export const userRoutes: Router = Router();

userRoutes.get(
  '/:id',
  validateRequest({ params: userIdpParamsSchema }),
  asyncHandler(getUserHandler),
);
userRoutes.post(
  '/',
  validateRequest({ body: createUserSchema }),
  asyncHandler(createUserHandler),
);
