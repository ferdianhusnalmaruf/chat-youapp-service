import { z } from '@chat-youapp/common';

export const createUserSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(225),
  birthday: z.string().optional(),
  height: z.number().optional(),
  weight: z.number().optional(),
  interests: z.array(z.string()).optional(),
});

export const updateUserSchema = z.object({
  birthday: z.string().optional(),
  height: z.number().optional(),
  weight: z.number().optional(),
  interests: z.array(z.string()).optional(),
});

export const userIdpParamsSchema = z.object({
  id: z.string().uuid(),
});
