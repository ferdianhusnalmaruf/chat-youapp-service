import { conversationService } from '@/services/conversation.service';
import { messageService } from '@/services/mesage.service';
import { getAutheticationUser } from '@/utils/auth';
import {
  createConversationSchema,
  listConversationsSchema,
} from '@/validation/conversation.schema';
import { createMessageBodySchema, listMessageQuerySchema } from '@/validation/message.schema';
import { conversationIdParamsSchema } from '@/validation/shared.schema';
import { asyncHandler, HttpError, type AsyncHandler } from '@chat-youapp/common';
import { RequestHandler } from 'express';

const parsedConversation = (params: unknown) => {
  const { conversationId } = conversationIdParamsSchema.parse(params);
  return conversationId;
};

export const createConversationHandler: RequestHandler = asyncHandler(async (req, res) => {
  const user = getAutheticationUser(req);
  const payload = createConversationSchema.parse(req.body);
  const uniqueParticipantIds = Array.from(new Set([...payload.participantIds, user.id]));

  if (uniqueParticipantIds.length < 2) {
    throw new HttpError(400, 'A conversation must have at least 2 unique participants');
  }

  const conversation = await conversationService.createConversation({
    title: payload.title,
    participantIds: uniqueParticipantIds,
  });

  res.status(201).json({ data: conversation });
});

export const listConversationsHandler: RequestHandler = asyncHandler(async (req, res) => {
  const user = getAutheticationUser(req);
  const filter = listConversationsSchema.parse(req.query);

  if (filter.participantId && filter.participantId !== user.id) {
    throw new HttpError(403, 'You can only list conversations for yourself');
  }

  const conversations = await conversationService.listConversations(filter);

  res.status(200).json({ data: conversations });
});

export const getConversationHandler: RequestHandler = asyncHandler(async (req, res) => {
  const user = getAutheticationUser(req);
  const conversationId = parsedConversation(req.params);

  const conversation = await conversationService.getConversationById(conversationId);

  if (!conversation.participantIds.includes(user.id)) {
    throw new HttpError(403, 'You are not a participant of this conversation');
  }

  res.status(200).json({ data: conversation });
});

export const createMesssageHandler: RequestHandler = asyncHandler(async (req, res) => {
  const user = getAutheticationUser(req);
  const conversationId = parsedConversation(req.params);
  const payload = createMessageBodySchema.parse(req.body);
  const message = await messageService.createMessage(conversationId, user.id, payload.body);

  res.status(201).json({ data: message });
});

export const listMessageHandler: RequestHandler = asyncHandler(async (req, res) => {
  const user = getAutheticationUser(req);
  const conversationId = parsedConversation(req.params);
  const options = listMessageQuerySchema.parse(req.query);
  const after = options.after ? new Date(options.after) : undefined;
  const messages = await messageService.listMessages(conversationId, user.id, {
    limit: options.limit,
    after,
  });

  res.json({ data: messages });
});
