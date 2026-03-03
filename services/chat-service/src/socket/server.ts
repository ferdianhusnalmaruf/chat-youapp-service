import { AuthenticationUser, HttpError, USER_ID_HEADER, z } from '@chat-youapp/common';
import { Server, Socket } from 'socket.io';

import { conversationService } from '@/services/conversation.service';
import { messageService } from '@/services/mesage.service';
import { logger } from '@/utils/logger';
import {
  CHAT_EVENTS,
  roomEventSchema,
  sendMessageEventSchema,
  type RoomEventPayload,
  type SendMessageEventPayload,
} from './events';

const userIdSchema = z.string().uuid();

const roomName = (conversationId: string) => `conversation:${conversationId}`;

const getSocketUser = (socket: Socket): AuthenticationUser => {
  const user = socket.data.user as AuthenticationUser | undefined;
  if (!user) {
    throw new HttpError(401, 'Unauthorized');
  }
  return user;
};

const assertParticipant = async (conversationId: string, userId: string): Promise<void> => {
  const conversation = await conversationService.getConversationById(conversationId);

  if (!conversation.participantIds.includes(userId)) {
    throw new HttpError(403, 'You are not a participant of this conversation');
  }
};

const emitSocketError = (socket: Socket, error: unknown): void => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  socket.emit(CHAT_EVENTS.SOCKET_ERROR, { message });
};

const onJoinConversation = async (socket: Socket, payload: RoomEventPayload): Promise<void> => {
  const user = getSocketUser(socket);
  await assertParticipant(payload.conversationId, user.id);
  await socket.join(roomName(payload.conversationId));
};

const onLeaveConversation = async (socket: Socket, payload: RoomEventPayload): Promise<void> => {
  const user = getSocketUser(socket);
  await assertParticipant(payload.conversationId, user.id);
  await socket.leave(roomName(payload.conversationId));
};

const onSendMessage = async (
  io: Server,
  socket: Socket,
  payload: SendMessageEventPayload,
): Promise<void> => {
  const user = getSocketUser(socket);

  const message = await messageService.createMessage(payload.conversationId, user.id, payload.body);

  io.to(roomName(payload.conversationId)).emit(CHAT_EVENTS.MESSAGE_CREATED, message);
};

export const registerSocketServer = (io: Server): void => {
  io.use((socket, next) => {
    try {
      const authUserId = socket.handshake.auth.userId;
      const headerUserId = socket.handshake.headers[USER_ID_HEADER] as string | undefined;
      const userId = userIdSchema.parse(authUserId ?? headerUserId);

      socket.data.user = { id: userId };

      next();
    } catch {
      next(new Error('Invalid or missing user context'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user as AuthenticationUser;
    logger.info({ socketId: socket.id, userId: user.id }, 'Socket connected');

    socket.on(CHAT_EVENTS.JOIN_CONVERSATION, async (rawPayload: unknown) => {
      try {
        const payload = roomEventSchema.parse(rawPayload);
        await onJoinConversation(socket, payload);
      } catch (error) {
        emitSocketError(socket, error);
      }
    });

    socket.on(CHAT_EVENTS.LEAVE_CONVERSATION, async (rawPayload: unknown) => {
      try {
        const payload = roomEventSchema.parse(rawPayload);
        await onLeaveConversation(socket, payload);
      } catch (error) {
        emitSocketError(socket, error);
      }
    });

    socket.on(CHAT_EVENTS.SEND_MESSAGE, async (rawPayload: unknown) => {
      try {
        const payload = sendMessageEventSchema.parse(rawPayload);
        await onSendMessage(io, socket, payload);
      } catch (error) {
        emitSocketError(socket, error);
      }
    });

    socket.on('disconnect', (reason) => {
      logger.info({ socketId: socket.id, reason }, 'Socket disconnected');
    });
  });
};
