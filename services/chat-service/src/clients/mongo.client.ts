import { MongoClient } from 'mongodb';
import { env } from '@/config/env';
import { logger } from '@/utils/logger';

let client: MongoClient | null = null;

export const getMongoClient = async (): Promise<MongoClient> => {
  if (client) {
    return client;
  }

  const mongoUrl = env.MONGO_URL;
  client = new MongoClient(mongoUrl);
  await client.connect();
  logger.info({ mongoUrl }, 'Connected to MongoDB');
  return client;
};

export const closeMongoClient = async (): Promise<void> => {
  if (client) {
    await client.close();
    logger.info('Closed MongoDB connection');
    client = null;
  } else {
    return;
  }
};
