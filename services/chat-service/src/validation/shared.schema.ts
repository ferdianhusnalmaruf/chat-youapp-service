import { z } from '@chat-youapp/common';

export const conversationIdParamsSchema = z.object({
  conversationId: z.string().uuid(),
});
