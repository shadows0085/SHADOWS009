import { Router } from 'express';
import authRoutes from './auth.routes';
import videoRoutes from './video.routes';
import uploadRoutes from './upload.routes';
import auditRoutes from './audit.routes';
import adminRoutes from './admin.routes';
import healthRoutes from './health.routes';
import portfolioRoutes from './portfolio.routes';
import fileEditorRoutes from './fileEditor.routes';
import socRoutes from './soc.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/videos', videoRoutes);
router.use('/uploads', uploadRoutes);
router.use('/audit-logs', auditRoutes);
router.use('/admins', adminRoutes);
router.use('/health', healthRoutes);
router.use('/portfolio', portfolioRoutes);
router.use('/files', fileEditorRoutes);
router.use('/soc', socRoutes);

export default router;
