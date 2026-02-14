import { createApp } from '@/app';
import { createServer } from 'http';
import { env } from 'process';
import { logger } from './utils/logger';

const bootstrap = async () => {
  try {
    const app = createApp();
    const server = createServer(app);

    const port = env.GATEWAY_SERVICE_PORT;

    server.listen(port, () => {
      logger.info({ port }, 'Auth service start running');
    });

    const shutdown = () => {
      logger.info('Closed gateway service...');

      Promise.all([])
        .catch((error: unknown) => {
          logger.error({ error }, 'Error during close the gateway service');
        })
        .finally(() => {
          server.close(() => process.exit(0));
        });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    logger.error({ error }, 'Failed run gateway service');
    process.exit(1);
  }
};

bootstrap();
