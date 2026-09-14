"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const upload_controller_1 = require("../controllers/upload.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rateLimiter_middleware_1 = require("../middleware/rateLimiter.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const upload_validator_1 = require("../validators/upload.validator");
const env_1 = require("../config/env");
const router = (0, express_1.Router)();
// Keep the convenience endpoint deliberately small. Large media is uploaded
// through the resumable endpoints below so a multi-gigabyte file is never held
// in a single Node.js Buffer.
const DIRECT_UPLOAD_MAX_BYTES = Math.min(env_1.env.MAX_VIDEO_SIZE_BYTES, 50 * 1024 * 1024);
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: DIRECT_UPLOAD_MAX_BYTES
    }
});
router.use(auth_middleware_1.authenticateAdmin);
router.use(rateLimiter_middleware_1.uploadRateLimiter);
// 1. Direct Single File Upload
router.post('/single', (0, auth_middleware_1.requirePermission)('video:create'), upload.single('file'), upload_controller_1.UploadController.uploadSingle);
// 2. Resumable Chunk Upload Endpoints
router.post('/chunked/initiate', (0, auth_middleware_1.requirePermission)('video:create'), (0, validation_middleware_1.validateRequest)({ body: upload_validator_1.initiateUploadSchema }), upload_controller_1.UploadController.initiateChunked);
router.put('/chunked/:sessionId', (0, auth_middleware_1.requirePermission)('video:create'), (0, validation_middleware_1.validateRequest)({ params: upload_validator_1.appendChunkParamsSchema, query: upload_validator_1.appendChunkQuerySchema }), upload.single('chunk'), upload_controller_1.UploadController.appendChunk);
router.post('/chunked/:sessionId/complete', (0, auth_middleware_1.requirePermission)('video:create'), (0, validation_middleware_1.validateRequest)({ params: upload_validator_1.appendChunkParamsSchema }), upload_controller_1.UploadController.finalizeChunked);
router.get('/chunked/:sessionId/status', (0, auth_middleware_1.requirePermission)('video:create'), (0, validation_middleware_1.validateRequest)({ params: upload_validator_1.appendChunkParamsSchema }), upload_controller_1.UploadController.getStatus);
router.delete('/chunked/:sessionId', (0, auth_middleware_1.requirePermission)('video:create'), (0, validation_middleware_1.validateRequest)({ params: upload_validator_1.appendChunkParamsSchema }), upload_controller_1.UploadController.cancel);
exports.default = router;
