import { UserModel } from '@/db';
import type { CreateUserInput, UpdateUserInput, User } from '@/types/user';
import type { AuthUserRegisteredPayload } from '@chat-youapp/common';
import { Op, WhereOptions } from 'sequelize';

const toDomainUser = (model: UserModel): User => ({
  id: model.id,
  email: model.email,
  username: model.username,
  birthday: model.birthday,
  height: model.height,
  weight: model.weight,
  interests: model.interests,
  createdAt: model.createdAt,
  updatedAt: model.updatedAt,
});

export class UserRepository {
  async findById(id: string): Promise<User | null> {
    console.log('Searching for user with ID:', id);
    const user = await UserModel.findByPk(id);
    console.log('User found:', user ? 'Yes' : 'No');
    if (user) {
      console.log('User data:', JSON.stringify(user.toJSON(), null, 2));
    }

    return user ? toDomainUser(user) : null;
  }

  async findAll(): Promise<User[]> {
    const users = await UserModel.findAll({
      order: [['username', 'ASC']],
    });

    return users.map(toDomainUser);
  }

  async create(data: CreateUserInput): Promise<User> {
    const user = await UserModel.create(data);

    return toDomainUser(user);
  }

  async updateUser(id: string, data: Partial<UpdateUserInput>): Promise<User> {
    const user = await UserModel.findByPk(id);

    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }

    await user.update(data);

    return toDomainUser(user);
  }

  async searchByQuery(
    query: string,
    options: { limit?: number; excludeIds?: string[] } = {},
  ): Promise<User[]> {
    const where: WhereOptions = {
      [Op.or]: [
        { username: { [Op.iLike]: `%${query}%` } },
        { email: { [Op.iLike]: `%${query}%` } },
      ],
    };

    if (options.excludeIds && options.excludeIds.length > 0) {
      Object.assign(where, {
        [Op.and]: [{ id: { [Op.notIn]: options.excludeIds } }],
      });
    }

    const users = await UserModel.findAll({
      where,
      order: [['username', 'ASC']],
      limit: options.limit ?? 10,
    });

    return users.map(toDomainUser);
  }

  async upsertFromAuthEvent(payload: AuthUserRegisteredPayload): Promise<User> {
    const [user] = await UserModel.upsert(
      {
        id: payload.id,
        email: payload.email,
        username: payload.username,
        createdAt: new Date(payload.createdAt),
        updatedAt: new Date(payload.createdAt),
      },
      {
        returning: true,
      },
    );

    return toDomainUser(user);
  }
}

export const userRepository = new UserRepository();
