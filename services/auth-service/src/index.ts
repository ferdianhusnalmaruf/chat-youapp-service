import { createApp } from '@/app';
import { createServer } from 'http';
import { env } from 'process';
import { logger } from '@/utils/logger';
import { closeDatabase, connectToDatabase } from '@/db/sequelize';
import { initModels } from '@/models';
import { closePublisher, initPublisher } from '@/messaging/event-publishing';

const bootstrap = async () => {
  try {
    await connectToDatabase();
    await initModels();
    await initPublisher();

    const app = createApp();
    const server = createServer(app);

    const port = env.AUTH_SERVICE_PORT;

    server.listen(port, () => {
      logger.info({ port }, 'Auth service start running');
    });

    const shutdown = () => {
      logger.info('Closed auth service...');

      Promise.all([closeDatabase(), closePublisher()])
        .catch((error: unknown) => {
          logger.error({ error }, 'Error during close the auth service');
        })
        .finally(() => {
          server.close(() => process.exit(0));
        });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    logger.error({ error }, 'Failed run auth service');
    process.exit(1);
  }
};

bootstrap();
