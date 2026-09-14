import { z } from 'zod';

export const createVideoSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(200),
  description: z.string().max(5000).optional(),
  storageKey: z.string().min(5, 'Valid storageKey required'),
  thumbnailKey: z.string().optional(),
  mimeType: z.enum(['video/mp4', 'video/webm', 'video/quicktime']),
  fileSize: z.coerce.number().positive(),
  duration: z.coerce.number().min(0).optional().default(0),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional().default('DRAFT'),
  visibility: z.enum(['PUBLIC', 'PRIVATE', 'UNLISTED']).optional().default('PRIVATE')
});

export const updateVideoSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  description: z.string().max(5000).nullable().optional(),
  thumbnailKey: z.string().nullable().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  visibility: z.enum(['PUBLIC', 'PRIVATE', 'UNLISTED']).optional(),
  duration: z.coerce.number().min(0).optional()
});

export const videoQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  visibility: z.enum(['PUBLIC', 'PRIVATE', 'UNLISTED']).optional(),
  uploadedBy: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title', 'fileSize', 'duration']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
});
