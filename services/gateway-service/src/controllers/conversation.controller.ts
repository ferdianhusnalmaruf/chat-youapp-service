import { chatProxyService } from '@/services/chat-proxy.service';
import { getAutheticationUser } from '@/utils/auth';
import {
  conversationIdParamsSchema,
  createConversationSchema,
  listConversationsSchema,
} from '@/validation/conversation.schema';
import { createMessageBodySchema, listMessagesQuerySchema } from '@/validation/message.schema';
import { asyncHandler, HttpError } from '@chat-youapp/common';
import { RequestHandler } from 'express';

export const createConversationHandler: RequestHandler = asyncHandler(async (req, res) => {
  const user = getAutheticationUser(req);
  const payload = createConversationSchema.parse(req.body);

  const uniqueParticipantIds = Array.from(new Set([...payload.participantIds, user.id]));

  if (uniqueParticipantIds.length < 2) {
    throw new HttpError(400, 'A conversation must have at least 2 unique participants');
  }

  const conversation = await chatProxyService.createConversation(user.id, {
    title: payload.title,
    participantIds: uniqueParticipantIds,
  });

  res.status(201).json({ data: conversation });
});

export const listConversationsHandler: RequestHandler = asyncHandler(async (req, res) => {
  const user = getAutheticationUser(req);
  const { participantId } = listConversationsSchema.parse(req.query);

  if (participantId && participantId !== user.id) {
    throw new HttpError(403, 'You can only list conversations for yourself');
  }

  const conversations = await chatProxyService.listConversations(user.id);

  res.json({ data: conversations });
});

export const getConversationHandler: RequestHandler = asyncHandler(async (req, res) => {
  const user = getAutheticationUser(req);
  const { id } = conversationIdParamsSchema.parse(req.params);
  const conversation = await chatProxyService.getConversation(user.id, id);

  if (!conversation.participantIds.includes(user.id)) {
    throw new HttpError(403, 'You are not a participant of this conversation');
  }

  res.json({ data: conversation });
});

export const createMessageHandler: RequestHandler = asyncHandler(async (req, res) => {
  const user = getAutheticationUser(req);
  const { id } = conversationIdParamsSchema.parse(req.params);
  const payload = createMessageBodySchema.parse(req.body);
  const message = await chatProxyService.createMessage(user.id, id, { body: payload.body });
  res.status(201).json({ data: message });
});

export const listMessageHandler: RequestHandler = asyncHandler(async (req, res) => {
  const user = getAutheticationUser(req);
  const { id } = conversationIdParamsSchema.parse(req.params);
  const query = listMessagesQuerySchema.parse(req.query);
  const messages = await chatProxyService.listMessages(user.id, id, query);
  res.json({ data: messages });
});
