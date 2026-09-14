"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = require("./config/env");
const logger_1 = require("./utils/logger");
const prisma_client_1 = require("./repositories/prisma.client");
const startServer = async () => {
    const app = (0, app_1.createApp)();
    const server = app.listen(env_1.env.PORT, env_1.env.HOST, () => {
        logger_1.logger.info(`🛡️  [${env_1.env.APP_NAME}] Secure Video Management API running on http://${env_1.env.HOST}:${env_1.env.PORT}`);
        logger_1.logger.info(`   Environment: ${env_1.env.NODE_ENV}`);
        logger_1.logger.info(`   Health Endpoint: http://${env_1.env.HOST}:${env_1.env.PORT}/api/v1/health`);
        // Periodic cleanup of abandoned/expired chunked upload sessions
        const { UploadService } = require('./services/upload.service');
        const runUploadCleanup = () => {
            UploadService.cleanupExpiredSessions()
                .then((count) => {
                if (count > 0)
                    logger_1.logger.info(`[Upload Cleaner] Purged ${count} abandoned or expired upload sessions.`);
            })
                .catch(() => { });
        };
        runUploadCleanup();
        const cleanupInterval = setInterval(runUploadCleanup, 30 * 60 * 1000);
        cleanupInterval.unref();
    });
    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
        logger_1.logger.info(`${signal} signal received: initiating graceful server shutdown...`);
        server.close(async () => {
            logger_1.logger.info('HTTP server closed.');
            try {
                await prisma_client_1.prisma.$disconnect();
                logger_1.logger.info('Database connection closed.');
                process.exit(0);
            }
            catch (err) {
                logger_1.logger.error({ err }, 'Error during database disconnection.');
                process.exit(1);
            }
        });
        // Force close after 10s timeout
        setTimeout(() => {
            logger_1.logger.error('Forced shutdown: operations timed out.');
            process.exit(1);
        }, 10000);
    };
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
};
startServer().catch(err => {
    logger_1.logger.fatal({ err }, 'Failed to start backend server');
    process.exit(1);
});
