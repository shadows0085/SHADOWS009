import { Router } from 'express';
import multer from 'multer';
import { UploadController } from '../controllers/upload.controller';
import { authenticateAdmin, requirePermission } from '../middleware/auth.middleware';
import { uploadRateLimiter } from '../middleware/rateLimiter.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { initiateUploadSchema, appendChunkParamsSchema, appendChunkQuerySchema } from '../validators/upload.validator';
import { env } from '../config/env';

const router = Router();

// Keep the convenience endpoint deliberately small. Large media is uploaded
// through the resumable endpoints below so a multi-gigabyte file is never held
// in a single Node.js Buffer.
const DIRECT_UPLOAD_MAX_BYTES = Math.min(env.MAX_VIDEO_SIZE_BYTES, 50 * 1024 * 1024);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: DIRECT_UPLOAD_MAX_BYTES
  }
});

router.use(authenticateAdmin);
router.use(uploadRateLimiter);

// 1. Direct Single File Upload
router.post(
  '/single',
  requirePermission('video:create'),
  upload.single('file'),
  UploadController.uploadSingle
);

// 2. Resumable Chunk Upload Endpoints
router.post(
  '/chunked/initiate',
  requirePermission('video:create'),
  validateRequest({ body: initiateUploadSchema }),
  UploadController.initiateChunked
);

router.put(
  '/chunked/:sessionId',
  requirePermission('video:create'),
  validateRequest({ params: appendChunkParamsSchema, query: appendChunkQuerySchema }),
  upload.single('chunk'),
  UploadController.appendChunk
);

router.post(
  '/chunked/:sessionId/complete',
  requirePermission('video:create'),
  validateRequest({ params: appendChunkParamsSchema }),
  UploadController.finalizeChunked
);

router.get(
  '/chunked/:sessionId/status',
  requirePermission('video:create'),
  validateRequest({ params: appendChunkParamsSchema }),
  UploadController.getStatus
);

router.delete(
  '/chunked/:sessionId',
  requirePermission('video:create'),
  validateRequest({ params: appendChunkParamsSchema }),
  UploadController.cancel
);

export default router;
