import { sequelize } from '@/db/sequelize';
import { publishUserRegistered } from '@/messaging/event-publishing';
import { RefreshToken, UserCredentials } from '@/models';
import { AuthResponse, AuthTokens, LoginInput, RegisterInput } from '@/type/auth';
import { logger } from '@/utils/logger';
import {
  hashingPassword,
  signAccessToken,
  signRefreshToken,
  verifyPassword,
  verifyRefreshToken,
} from '@/utils/token';
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

export const login = async (input: LoginInput): Promise<AuthTokens> => {
  const credentials = await UserCredentials.findOne({ where: { email: { [Op.eq]: input.email } } });
  console.log(`credentials login : ${credentials?.toJSON}`);

  if (!credentials) {
    throw new HttpError(401, 'Invalid credentials');
  }

  const valid = await verifyPassword(input.password, credentials.password);

  if (!valid) {
    throw new HttpError(401, 'Invalid password credentials');
  }

  const refreshTokenRecord = await createRefreshToken(credentials.id);
  const refreshToken = signRefreshToken({
    sub: credentials.id,
    tokenId: refreshTokenRecord.tokenId,
  });

  const accessToken = signAccessToken({
    sub: credentials.id,
    email: credentials.email,
  });

  return {
    accessToken,
    refreshToken,
  };
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

export const refreshTokens = async (token: string): Promise<AuthTokens> => {
  const payload = verifyRefreshToken(token);

  const oldTokenRecord = await RefreshToken.findOne({
    where: {
      tokenId: payload.tokenId,
      userId: payload.sub,
    },
  });

  if (!oldTokenRecord) {
    throw new HttpError(401, 'Invalid refresh token');
  }

  if (oldTokenRecord.expiredAt.getTime() < Date.now()) {
    await oldTokenRecord.destroy();
    throw new HttpError(409, 'Refresh token has expired');
  }

  const credential = await UserCredentials.findByPk(payload.sub);

  if (!credential) {
    logger.warn({ userId: payload.sub }, 'User missing for refresh token');
    throw new HttpError(401, 'Invalid refresh token');
  }

  await oldTokenRecord.destroy();
  const newRTokenRecord = await createRefreshToken(credential.id);

  const accessToken = signAccessToken({
    sub: credential.id,
    email: credential.email,
  });

  const refreshToken = signRefreshToken({
    sub: credential.id,
    tokenId: newRTokenRecord.tokenId,
  });

  return {
    accessToken,
    refreshToken,
  };
};

export const revokeRefreshToken = async (userId: string) => {
  await RefreshToken.destroy({ where: { userId } });
};
