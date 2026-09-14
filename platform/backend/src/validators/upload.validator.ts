import { z } from 'zod';

export const initiateUploadSchema = z.object({
  fileName: z.string().min(1).max(255),
  mimeType: z.enum(['video/mp4', 'video/webm', 'video/quicktime']),
  fileSize: z.coerce.number().positive()
});

export const appendChunkParamsSchema = z.object({
  sessionId: z.string().uuid()
});

export const appendChunkQuerySchema = z.object({
  chunkIndex: z.coerce.number().int().min(0)
});
