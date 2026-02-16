import { Router } from 'express';
import { conversationRouter } from './conversation.routes';

export const registerRoutes = (app: Router): void => {
  app.use('/conversations', conversationRouter);
};
