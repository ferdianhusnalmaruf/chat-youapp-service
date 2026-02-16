import { messageRepository } from '@/repositories/message.repository';
import { Message, MessageListOptions } from '@/types/message';
import { conversationService } from './conversation.service';
import { HttpError } from '@chat-youapp/common';

export const messageService = {
  async createMessage(conversationId: string, senderId: string, body: string): Promise<Message> {
    const conversation = await conversationService.getConversationById(conversationId);

    if (!conversation.participantIds.includes(senderId)) {
      throw new HttpError(403, 'You are not a participant of this conversation');
    }

    const message = await messageRepository.createMessage(conversationId, senderId, body);

    await conversationService.lastSeenMessage(conversationId, body.slice(0, 120));

    return message;
  },

  async listMessages(
    conversationId: string,
    requesterId: string,
    options: MessageListOptions = {},
  ): Promise<Message[]> {
    const conversation = await conversationService.getConversationById(conversationId);

    if (!conversation.participantIds.includes(requesterId)) {
      throw new HttpError(403, 'You are not a participant of this conversation');
    }

    return messageRepository.findByConversationId(conversationId, options);
  },
};
