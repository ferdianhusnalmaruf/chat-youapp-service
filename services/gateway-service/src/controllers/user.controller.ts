import { userProxyService } from '@/services/user-proxy.service';
import { createUserSchema, userIdpParamsSchema } from '@/validation/user.schema';
import { AsyncHandler } from '@chat-youapp/common';

export const getUserHandler: AsyncHandler = async (req, res, next) => {
  try {
    const { id } = userIdpParamsSchema.parse(req.params);

    const response = await userProxyService.getUserById(id);
    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const createUserHandler: AsyncHandler = async (req, res, next) => {
  try {
    const payload = createUserSchema.parse(req.body);

    const response = await userProxyService.createUser(payload);
    res.json(response);
  } catch (error) {
    next(error);
  }
};
