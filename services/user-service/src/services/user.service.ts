import { publishUserCreatedEvent } from '@/messaging/event-publishing';
import { userRepository, UserRepository } from '@/repositories/user.repositories';
import { CreateUserInput, User } from '@/types/user';
import { AuthUserRegisteredPayload, HttpError } from '@chat-youapp/common';
import { UniqueConstraintError } from 'sequelize';

class UserService {
  constructor(private readonly respository: UserRepository) {}

  async syncFromAuthUser(payload: AuthUserRegisteredPayload): Promise<User> {
    const user = await this.respository.upsertFromAuthEvent(payload);
    void publishUserCreatedEvent({
      id: user.id,
      username: user.username,
      email: user.email,
      birthday: user.birthday?.toISOString(),
      weight: user.weight,
      height: user.height,
      interests: user.interests ?? [],
      createdAt: user.createdAt.toISOString(),
    });
    return user;
  }

  async getUserById(id: string): Promise<User> {
    console.log('id from sevice getUserBy id', id);
    const user = await this.respository.findById(id);
    if (!user) {
      throw new HttpError(404, 'User not found');
    }

    return user;
  }

  async createUser(input: CreateUserInput): Promise<User> {
    try {
      const user = await this.respository.create(input);

      void publishUserCreatedEvent({
        id: user.id,
        username: user.username,
        email: user.email,
        birthday: user.birthday?.toISOString(),
        weight: user.weight,
        height: user.height,
        interests: user.interests ?? [],
        createdAt: user.createdAt.toISOString(),
      });

      return user;
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new HttpError(409, 'The user already exists ');
      }
      throw error;
    }
  }
}

export const userService = new UserService(userRepository);
