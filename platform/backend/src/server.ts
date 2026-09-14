import { createApp } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import { prisma } from './repositories/prisma.client';

const startServer = async () => {
  const app = createApp();

  const server = app.listen(env.PORT, env.HOST, () => {
    logger.info(
      `🛡️  [${env.APP_NAME}] Secure Video Management API running on http://${env.HOST}:${env.PORT}`
    );
    logger.info(`   Environment: ${env.NODE_ENV}`);
    logger.info(`   Health Endpoint: http://${env.HOST}:${env.PORT}/api/v1/health`);

    // Periodic cleanup of abandoned/expired chunked upload sessions
    const { UploadService } = require('./services/upload.service');
    const runUploadCleanup = () => {
      UploadService.cleanupExpiredSessions()
        .then((count: number) => {
          if (count > 0) logger.info(`[Upload Cleaner] Purged ${count} abandoned or expired upload sessions.`);
        })
        .catch(() => {});
    };
    runUploadCleanup();
    const cleanupInterval = setInterval(runUploadCleanup, 30 * 60 * 1000);
    cleanupInterval.unref();
  });

  // Graceful shutdown
  const gracefulShutdown = async (signal: string) => {
    logger.info(`${signal} signal received: initiating graceful server shutdown...`);
    server.close(async () => {
      logger.info('HTTP server closed.');
      try {
        await prisma.$disconnect();
        logger.info('Database connection closed.');
        process.exit(0);
      } catch (err) {
        logger.error({ err }, 'Error during database disconnection.');
        process.exit(1);
      }
    });

    // Force close after 10s timeout
    setTimeout(() => {
      logger.error('Forced shutdown: operations timed out.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
};

startServer().catch(err => {
  logger.fatal({ err }, 'Failed to start backend server');
  process.exit(1);
});
