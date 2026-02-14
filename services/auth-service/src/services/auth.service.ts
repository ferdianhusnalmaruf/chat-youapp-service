import { sequelize } from '@/db/sequelize';
import { publishUserRegistered } from '@/messaging/event-publishing';
import { RefreshToken, UserCredentials } from '@/models';
import { AuthResponse, RegisterInput } from '@/type/auth';
import { hashingPassword, signAccessToken, signRefreshToken } from '@/utils/token';
import { HttpError } from '@chat-youapp/common';
import { Op, Transaction } from 'sequelize';

const REFRESH_TOKEN_TLL_DAYS = 30;

export const register = async (input: RegisterInput): Promise<AuthResponse> => {
  const existing = await UserCredentials.findOne({
    where: {
      email: {
        [Op.eq]: input.email,
      },
    },
  });

  if (existing) {
    throw new HttpError(409, 'User with email already exists');
  }

  const transaction = await sequelize.transaction();

  try {
    const password = await hashingPassword(input.password);

    const user = await UserCredentials.create(
      {
        email: input.email,
        username: input.username,
        password,
      },
      {
        transaction,
      },
    );

    const refreshTokenRecord = await createRefreshToken(user.id, transaction);

    await transaction.commit();

    const accessToken = signAccessToken({ sub: user.id, email: user.email });
    const refreshToken = signRefreshToken({
      sub: user.id,
      tokenId: refreshTokenRecord.tokenId,
    });

    const userData = {
      id: user.id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt.toISOString(),
    };

    publishUserRegistered(userData);

    return {
      accessToken,
      refreshToken,
      user: userData,
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const createRefreshToken = async (userId: string, transaction?: Transaction) => {
  const expiredAt = new Date();
  expiredAt.setDate(expiredAt.getDate() + REFRESH_TOKEN_TLL_DAYS);

  const tokenId = crypto.randomUUID();

  const record = await RefreshToken.create(
    {
      userId,
      tokenId,
      expiredAt,
    },
    {
      transaction,
    },
  );

  return record;
};
