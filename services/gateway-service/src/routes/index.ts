import type { Router } from 'express';
import { authRouter } from './auth.routes';
import { userRouter } from './user.route';
import { conversationRouter } from './conversation.routes';

export const registerRoutes = (app: Router) => {
  app.use('/api/auth', authRouter);
  app.use('/api/users', userRouter);
  app.use('/api/conversations', conversationRouter);
};
