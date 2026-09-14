import { Router } from 'express';
import { HealthController } from '../controllers/health.controller';

const router = Router();

router.get('/live', HealthController.liveness);
router.get('/ready', HealthController.readiness);
router.get('/', HealthController.readiness);

export default router;
