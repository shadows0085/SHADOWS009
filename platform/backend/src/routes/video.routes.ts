import { Router } from 'express';
import { VideoController } from '../controllers/video.controller';
import { authenticateAdmin, requirePermission } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { createVideoSchema, updateVideoSchema, videoQuerySchema } from '../validators/video.validator';

const router = Router();

// Public signed streaming route (authenticated via HMAC token)
router.get('/stream/:ticket', VideoController.streamMedia);

// Protected video operations
router.use(authenticateAdmin);

router.get('/', requirePermission('video:read'), validateRequest({ query: videoQuerySchema }), VideoController.list);
router.get('/metrics', requirePermission('analytics:read'), VideoController.getMetrics);
router.get('/:id', requirePermission('video:read'), VideoController.getById);
router.get('/:id/ticket', requirePermission('video:stream'), VideoController.getStreamTicket);

router.post('/', requirePermission('video:create'), validateRequest({ body: createVideoSchema }), VideoController.create);
router.put('/:id', requirePermission('video:update'), validateRequest({ body: updateVideoSchema }), VideoController.update);
router.patch('/:id/status', requirePermission('video:publish'), VideoController.updateStatus);
router.delete('/:id', requirePermission('video:delete'), VideoController.delete);

export default router;
