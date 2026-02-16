import { z } from '@chat-youapp/common';

export const createUserSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(225),
  birthday: z.coerce.date().optional(),
  height: z.number().optional(),
  weight: z.number().optional(),
  interests: z.array(z.string()).optional(),
});
export const updateUserSchema = z.object({
  birthday: z.coerce.date().optional(),
  height: z.number().optional(),
  weight: z.number().optional(),
  interests: z.array(z.string()).optional(),
});

export const userIdpParamsSchema = z.object({
  id: z.string().uuid(),
});

export type CreateUserBody = z.infer<typeof createUserSchema>;
export type UpdateUserBody = z.infer<typeof updateUserSchema>;
export type UserIdParams = z.infer<typeof userIdpParamsSchema>;
