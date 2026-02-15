import { Sequelize } from 'sequelize';

import { env } from '@/config/env';
import { logger } from '@/utils/logger';

export const sequelize = new Sequelize(env.USER_DB_URL, {
  dialect: 'postgres',
  logging:
    env.NODE_ENV === 'development'
      ? (message: unknown) => {
          logger.debug({ sequlieze: message });
        }
      : false,

  define: {
    underscored: true,
    freezeTableName: true,
  },
});

export const connectToDatabase = async () => {
  await sequelize.authenticate();
  logger.info('User database connection established successfully');
};

export const initializedUserDatabase = async () => {
  await connectToDatabase();

  const syncOptions = env.NODE_ENV === 'development' ? {} : { alter: true };
  await sequelize.sync(syncOptions);
  logger.info('User database connection closed');
};

export const closeDatabase = async () => {
  await sequelize.close();

  logger.info('Database for user service will be closed connection');
};
