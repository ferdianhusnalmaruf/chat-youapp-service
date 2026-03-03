import { createApp } from '@/app';
import { createServer } from 'http';
import { logger } from '@/utils/logger';
import { closeMongoClient, getMongoClient } from '@/clients/mongo.client';
import { connectRedis, disconnectRedis } from '@/clients/redis.client';
import { startUserEventConsumer } from '@/messaging/rmq.consumer';
import { Server } from 'socket.io';
import { env } from '@/config/env';
import { registerSocketServer } from '@/socket/server';

const bootstrap = async () => {
  try {
    await Promise.all([getMongoClient(), connectRedis(), startUserEventConsumer()]);

    const app = createApp();
    const server = createServer(app);

    const port = env.CHAT_SERVICE_PORT;

    const io = new Server(server, {
      cors: {
        origin: '*',
        credentials: true,
      },
    });

    registerSocketServer(io);

    server.listen(port, () => {
      logger.info({ port }, 'Chat service start running');
    });
    const shutdown = () => {
      logger.info('Closed chat service...');

      io.close();

      Promise.all([closeMongoClient(), disconnectRedis()])
        .catch((error: unknown) => {
          logger.error({ error }, 'Error during close the chat service');
        })
        .finally(() => {
          server.close(() => process.exit(0));
        });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    logger.error({ error }, 'Failed run chat service');
    process.exit(1);
  }
};

bootstrap();
