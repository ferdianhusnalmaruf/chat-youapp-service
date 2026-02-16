import {
  createUserHandler,
  getUserHandler,
  updateUserHandler,
} from '@/controllers/user.controller';
import { createUserSchema, updateUserSchema, userIdpParamsSchema } from '@/validation/user.schema';
import { asyncHandler, validateRequest } from '@chat-youapp/common';
import { Router } from 'express';

export const userRoutes: Router = Router();

userRoutes.get(
  '/:id',
  validateRequest({ params: userIdpParamsSchema }),
  asyncHandler(getUserHandler),
);
userRoutes.post('/', validateRequest({ body: createUserSchema }), asyncHandler(createUserHandler));
userRoutes.patch(
  '/:id',
  validateRequest({ params: userIdpParamsSchema, body: updateUserSchema }),
  asyncHandler(updateUserHandler),
);
