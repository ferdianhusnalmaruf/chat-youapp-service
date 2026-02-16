import {
  createConversationHandler,
  createMessageHandler,
  getConversationHandler,
  listConversationsHandler,
  listMessageHandler,
} from '@/controllers/conversation.controller';
import { requireAuth } from '@/middleware/require-auth';
import {
  conversationIdParamsSchema,
  createConversationSchema,
  listConversationsSchema,
} from '@/validation/conversation.schema';
import { createMessageBodySchema, listMessagesQuerySchema } from '@/validation/message.schema';
import { validateRequest } from '@chat-youapp/common';
import { Router } from 'express';

export const conversationRouter: Router = Router();

conversationRouter.use(requireAuth);

conversationRouter.post(
  '/',
  validateRequest({ body: createConversationSchema }),
  createConversationHandler,
);

conversationRouter.get(
  '/',
  validateRequest({ query: listConversationsSchema }),
  listConversationsHandler,
);

conversationRouter.get(
  '/:id',
  validateRequest({ params: conversationIdParamsSchema }),
  getConversationHandler,
);

conversationRouter.get(
  '/:id/messages',
  validateRequest({ params: conversationIdParamsSchema, query: listMessagesQuerySchema }),
  listMessageHandler,
);

conversationRouter.post(
  '/:id/messages',
  validateRequest({ params: conversationIdParamsSchema, body: createMessageBodySchema }),
  createMessageHandler,
);
