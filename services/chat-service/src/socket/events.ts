import { z } from '@chat-youapp/common';

export const CHAT_EVENTS = {
  JOIN_CONVERSATION: 'join_conversation',
  LEAVE_CONVERSATION: 'leave_conversation',
  SEND_MESSAGE: 'send_message',
  MESSAGE_CREATED: 'message_created',
  MESSAGE_RECEIVED: 'message_received',
  SOCKET_ERROR: 'socket_error',
} as const;

export const roomEventSchema = z.object({
  conversationId: z.string().uuid(),
});

export const sendMessageEventSchema = roomEventSchema.extend({
  body: z.string().min(1).max(2000),
});

export type RoomEventPayload = z.infer<typeof roomEventSchema>;
export type SendMessageEventPayload = z.infer<typeof sendMessageEventSchema>;
