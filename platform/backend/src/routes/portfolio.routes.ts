import { Router } from 'express';
import multer from 'multer';
import { PortfolioController } from '../controllers/portfolio.controller';
import { authenticateAdmin, requirePermission } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import {
  createProjectSchema,
  updateProjectSchema,
  heroSchema,
  showcaseSchema,
  notificationsSchema
} from '../validators/portfolio.validator';
import { env } from '../config/env';

import fs from 'fs';
import os from 'os';
import path from 'path';
import { z } from 'zod';

const tempUploadDir = path.join(os.tmpdir(), 'secure_portfolio_uploads');
if (!fs.existsSync(tempUploadDir)) {
  try {
    fs.mkdirSync(tempUploadDir, { recursive: true });
  } catch {}
}

const router = Router();

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, tempUploadDir);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `upload_${Date.now()}_${Math.random().toString(36).substring(2, 9)}${ext}`);
    }
  }),
  limits: {
    // Disk-backed multer storage streams the file to a temporary directory, so
    // portfolio replacements can use the same configured video limit without
    // consuming the Node.js heap.
    fileSize: env.MAX_VIDEO_SIZE_BYTES
  },
  fileFilter: (_req, file, cb) => {
    const allowedExts = ['.mp4', '.webm', '.mov', '.m4v'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      const error: any = new Error('Only MP4, WebM, and QuickTime videos are allowed.');
      error.statusCode = 400;
      error.code = 'INVALID_FILE_TYPE';
      cb(error);
    }
  }
});

// Publicly readable for preview or authenticated for editing
router.get('/', PortfolioController.getAll);
router.get('/notifications', PortfolioController.getNotifications);
router.get('/videos', PortfolioController.getAvailableVideos);

// Protected mutations
router.use(authenticateAdmin);
router.post('/upload', requirePermission('video:create'), upload.single('file'), PortfolioController.uploadVideoAsset);
router.post(
  '/projects',
  requirePermission('video:create'),
  validateRequest({ body: createProjectSchema }),
  PortfolioController.addProject
);
router.put(
  '/projects/:id',
  requirePermission('video:update'),
  validateRequest({ body: updateProjectSchema }),
  PortfolioController.updateProject
);
router.delete(
  '/projects/:id',
  requirePermission('video:delete'),
  validateRequest({ body: z.object({ expectedVersion: z.number().int().positive() }).strict() }),
  PortfolioController.deleteProject
);
router.put(
  '/hero',
  requirePermission('video:update'),
  validateRequest({ body: heroSchema }),
  PortfolioController.updateHero
);
router.put(
  '/showcase',
  requirePermission('video:update'),
  validateRequest({ body: showcaseSchema }),
  PortfolioController.updateShowcase
);
router.put(
  '/notifications',
  requirePermission('video:update'),
  validateRequest({ body: notificationsSchema }),
  PortfolioController.updateNotifications
);

export default router;
