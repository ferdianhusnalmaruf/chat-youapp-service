import { userRepository, UserRepository } from '@/repositories/user.repositories';
import { User } from '@/types/user';
import { AuthUserRegisteredPayload } from '@chat-youapp/common';

class UserService {
  constructor(private readonly respository: UserRepository) {}

  async syncFromAuthUser(payload: AuthUserRegisteredPayload): Promise<User> {
    const user = await this.respository.upsertFromAuthEvent(payload);

    return user;
  }
}

export const userService = new UserService(userRepository);
