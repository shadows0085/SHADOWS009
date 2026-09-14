import { Request, Response } from 'express';
import { prisma } from '../repositories/prisma.client';
import { storageService } from '../services/storage.service';

export class HealthController {
  static async liveness(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      status: 'UP',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  }

  static async readiness(req: Request, res: Response): Promise<void> {
    let dbStatus = 'DOWN';
    let storageStatus = 'DOWN';

    try {
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = 'UP';
    } catch {
      dbStatus = 'DOWN';
    }

    try {
      const testPath = storageService.getAbsolutePath('');
      if (testPath) storageStatus = 'UP';
    } catch {
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
