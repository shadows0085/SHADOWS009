import { Router } from 'express';
import { AdminController } from '../controllers/audit.controller';
import { authenticateAdmin, requirePermission } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { createAdminSchema, updateAdminSchema } from '../validators/auth.validator';
import { z } from 'zod';

const router = Router();

router.use(authenticateAdmin);

router.get('/', requirePermission('admin:read'), AdminController.list);

router.post(
  '/',
  requirePermission('admin:create'),
  validateRequest({ body: createAdminSchema }),
  AdminController.create
);

router.put(
  '/:id',
  requirePermission('admin:update'),
  validateRequest({
    params: z.object({ id: z.string().uuid() }),
    body: updateAdminSchema
  }),
  AdminController.update
);

router.patch(
  '/:id/status',
  requirePermission('admin:update'),
  validateRequest({
    params: z.object({ id: z.string().uuid() }),
    body: z.object({ isActive: z.boolean() })
  }),
  AdminController.toggleStatus
);

router.delete(
  '/:id',
  requirePermission('admin:delete'),
  validateRequest({
    params: z.object({ id: z.string().uuid() })
  }),
  AdminController.delete
);

router.get(
  '/:id/activity',
  requirePermission('admin:read'),
  validateRequest({
    params: z.object({ id: z.string().uuid() })
  }),
  AdminController.getActivity
);

export default router;
