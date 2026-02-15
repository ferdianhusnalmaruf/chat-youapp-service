import { createApp } from '@/app';
import { createServer } from 'http';
import { env } from 'process';
import { logger } from '@/utils/logger';
import { initializedUserDatabase } from '@/db/sequelize';
import { startAuthEventConsumer } from './messaging/auth-consumer';

const bootstrap = async () => {
  try {
    await initializedUserDatabase();
    await startAuthEventConsumer();
    // try {
    // } catch (error) {
    //   logger.error({ error }, `ERROR initializedUserDatabase`);
    // }
    // try {
    // } catch (error) {
    //   logger.error({ error }, `ERROR startAuthEventConsumer`);
    // }

    const app = createApp();
    const server = createServer(app);

    const port = env.USER_SERVICE_PORT;

    server.listen(port, () => {
      logger.info({ port }, 'User service start running');
    });

    const shutdown = () => {
      logger.info('Closed user service...');

      Promise.all([])
        .catch((error: unknown) => {
          logger.error({ error }, 'Error during close the user service');
        })
        .finally(() => {
          server.close(() => process.exit(0));
        });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    logger.error({ error }, 'Failed run user service');
    process.exit(1);
  }
};

bootstrap();
