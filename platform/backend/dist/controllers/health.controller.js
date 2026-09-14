"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const prisma_client_1 = require("../repositories/prisma.client");
const storage_service_1 = require("../services/storage.service");
class HealthController {
    static async liveness(req, res) {
        res.status(200).json({
            status: 'UP',
            uptime: process.uptime(),
            timestamp: new Date().toISOString()
        });
    }
    static async readiness(req, res) {
        let dbStatus = 'DOWN';
        let storageStatus = 'DOWN';
        try {
            await prisma_client_1.prisma.$queryRaw `SELECT 1`;
            dbStatus = 'UP';
        }
        catch {
            dbStatus = 'DOWN';
        }
        try {
            const testPath = storage_service_1.storageService.getAbsolutePath('');
            if (testPath)
                storageStatus = 'UP';
        }
        catch {
            storageStatus = 'DOWN';
        }
        const isReady = dbStatus === 'UP' && storageStatus === 'UP';
        res.status(isReady ? 200 : 503).json({
            status: isReady ? 'READY' : 'DEGRADED',
            components: {
                database: dbStatus,
                storage: storageStatus
            },
            timestamp: new Date().toISOString()
        });
    }
}
exports.HealthController = HealthController;
