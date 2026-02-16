import { userService } from '@/services/user.service';
import { CreateUserBody, UserIdParams } from '@/validation/user.schema';
import type { AsyncHandler } from '@chat-youapp/common';

export const getUserHandler: AsyncHandler = async (req, res, next) => {
  try {
    const { id } = req.params as unknown as UserIdParams;
    const user = await userService.getUserById(id);

    res.json({ data: user });
  } catch (error) {
    next(error);
  }
};

export const createUserHandler: AsyncHandler = async (req, res, next) => {
  try {
    const payload = req.body as CreateUserBody;
    const user = await userService.createUser(payload);
    res.status(201).json({ data: user });
  } catch (error) {
    next(error);
  }
};
