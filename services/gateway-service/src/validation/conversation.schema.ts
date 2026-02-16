import { z } from '@chat-youapp/common';

export const createConversationSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  participantIds: z.array(z.string().uuid()).min(1),
});

export const listConversationsSchema = z.object({
  participantId: z.string().uuid().optional(),
});

export const conversationIdParamsSchema = z.object({
  id: z.string().uuid(),
});
