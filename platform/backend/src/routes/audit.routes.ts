import { Router } from 'express';
import { AuditController } from '../controllers/audit.controller';
import { authenticateAdmin, requirePermission } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateAdmin);
router.get('/', requirePermission('audit:read'), AuditController.list);

export default router;
