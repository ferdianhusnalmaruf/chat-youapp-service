import type { Router } from 'express';
import { authRouter } from './auth.routes';
import { userRouter } from './user.route';

export const registerRoutes = (app: Router) => {
  app.use('/api/auth', authRouter);
  app.use('/api/users', userRouter);
};
