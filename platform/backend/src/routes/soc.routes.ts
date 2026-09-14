import { Router } from 'express';
import { SocController } from '../controllers/soc.controller';
import { authenticateAdmin, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateAdmin);

router.get('/telemetry', SocController.getTelemetry);
router.post('/killswitch', requireRole(['SUPER_ADMIN']), SocController.triggerKillswitch);

export default router;
