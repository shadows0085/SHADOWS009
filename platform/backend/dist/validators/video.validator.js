"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.videoQuerySchema = exports.updateVideoSchema = exports.createVideoSchema = void 0;
const zod_1 = require("zod");
exports.createVideoSchema = zod_1.z.object({
    title: zod_1.z.string().min(2, 'Title must be at least 2 characters').max(200),
    description: zod_1.z.string().max(5000).optional(),
    storageKey: zod_1.z.string().min(5, 'Valid storageKey required'),
    thumbnailKey: zod_1.z.string().optional(),
    mimeType: zod_1.z.enum(['video/mp4', 'video/webm', 'video/quicktime']),
    fileSize: zod_1.z.coerce.number().positive(),
    duration: zod_1.z.coerce.number().min(0).optional().default(0),
    status: zod_1.z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional().default('DRAFT'),
    visibility: zod_1.z.enum(['PUBLIC', 'PRIVATE', 'UNLISTED']).optional().default('PRIVATE')
});
exports.updateVideoSchema = zod_1.z.object({
    title: zod_1.z.string().min(2).max(200).optional(),
    description: zod_1.z.string().max(5000).nullable().optional(),
    thumbnailKey: zod_1.z.string().nullable().optional(),
    status: zod_1.z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
    visibility: zod_1.z.enum(['PUBLIC', 'PRIVATE', 'UNLISTED']).optional(),
    duration: zod_1.z.coerce.number().min(0).optional()
});
exports.videoQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).optional().default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).optional().default(20),
    search: zod_1.z.string().optional(),
    status: zod_1.z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
    visibility: zod_1.z.enum(['PUBLIC', 'PRIVATE', 'UNLISTED']).optional(),
    uploadedBy: zod_1.z.string().optional(),
    sortBy: zod_1.z.enum(['createdAt', 'updatedAt', 'title', 'fileSize', 'duration']).optional().default('createdAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional().default('desc')
});
