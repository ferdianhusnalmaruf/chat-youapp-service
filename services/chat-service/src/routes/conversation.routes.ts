import {
  createConversationHandler,
  createMesssageHandler,
  getConversationHandler,
  listConversationsHandler,
  listMessageHandler,
} from '@/controllers/conversation.controller';
import { authenticatedUserMiddleware } from '@/middleware/authenticated-user';
import {
  createConversationSchema,
  listConversationsSchema,
} from '@/validation/conversation.schema';
import { createMessageBodySchema } from '@/validation/message.schema';
import { conversationIdParamsSchema } from '@/validation/shared.schema';
import { validateRequest } from '@chat-youapp/common';
import { Router } from 'express';

export const conversationRouter: Router = Router();

conversationRouter.use(authenticatedUserMiddleware);

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
  '/:conversationId',
  validateRequest({ params: conversationIdParamsSchema }),
  getConversationHandler,
);

conversationRouter.get(
  '/:conversationId/messages',
  validateRequest({ params: conversationIdParamsSchema }),
  listMessageHandler,
);

conversationRouter.post(
  '/:conversationId/messages',
  validateRequest({ params: conversationIdParamsSchema, body: createMessageBodySchema }),
  createMesssageHandler,
);
