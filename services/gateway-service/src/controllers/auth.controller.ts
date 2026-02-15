import { authProxyService } from '@/services/auth-proxy.service';
import { loginSchema, refreshSchema, registerSchema, revokeSchema } from '@/validation/auth.schema';
import { AsyncHandler } from '@chat-youapp/common';

export const registerUserHandler: AsyncHandler = async (req, res, next) => {
  try {
    const payload = registerSchema.parse(req.body);
    const response = await authProxyService.register(payload);
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};
export const loginUserHandler: AsyncHandler = async (req, res, next) => {
  try {
    const payload = loginSchema.parse(req.body);
    const response = await authProxyService.login(payload);
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};
export const refreshTokenHandler: AsyncHandler = async (req, res, next) => {
  try {
    const payload = refreshSchema.parse(req.body);
    const response = await authProxyService.refreshToken(payload);
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};
export const revokeTokenHandler: AsyncHandler = async (req, res, next) => {
  try {
    const payload = revokeSchema.parse(req.body);
    const response = await authProxyService.revokeToken(payload);
    res.status(204).json(response);
  } catch (error) {
    next(error);
  }
};
