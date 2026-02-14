import { authProxyService } from '@/services/auth-proxy.service';
import { registerSchema } from '@/validation/auth.schema';
import { AsyncHandler } from '@chat-youapp/common';

export const registerUser: AsyncHandler = async (req, res, next) => {
  try {
    const payload = registerSchema.parse(req.body);
    const response = await authProxyService.register(payload as any);
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};
