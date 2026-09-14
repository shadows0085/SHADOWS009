"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appendChunkQuerySchema = exports.appendChunkParamsSchema = exports.initiateUploadSchema = void 0;
const zod_1 = require("zod");
exports.initiateUploadSchema = zod_1.z.object({
    fileName: zod_1.z.string().min(1).max(255),
    mimeType: zod_1.z.enum(['video/mp4', 'video/webm', 'video/quicktime']),
    fileSize: zod_1.z.coerce.number().positive()
});
exports.appendChunkParamsSchema = zod_1.z.object({
    sessionId: zod_1.z.string().uuid()
});
exports.appendChunkQuerySchema = zod_1.z.object({
    chunkIndex: zod_1.z.coerce.number().int().min(0)
});
