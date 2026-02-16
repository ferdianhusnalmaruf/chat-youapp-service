import { z } from '@chat-youapp/common';

export const createMessageBodySchema = z.object({
  body: z.string().min(1).max(2000),
});

export const listMessagesQuerySchema = z.object({
  limit: z
    .preprocess(
      (val) => (val === undefined ? undefined : Number(val)),
      z.number().int().min(1).max(200),
    )
    .optional(),
  after: z.string().datetime().optional(),
});
