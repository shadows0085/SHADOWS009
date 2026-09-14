"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadController = void 0;
const upload_service_1 = require("../services/upload.service");
class UploadController {
    /**
     * Direct file upload with in-memory buffer inspection before writing to disk
     */
    static async uploadSingle(req, res, next) {
        try {
            if (!req.file) {
                res.status(400).json({
                    success: false,
                    error: { code: 'NO_FILE_UPLOADED', message: 'No file received in multipart request.' }
                });
                return;
            }
            const category = (req.body.category === 'thumbnails' ? 'thumbnails' : 'videos');
            const result = await upload_service_1.UploadService.processUploadedBuffer(req.file.buffer, req.file.originalname, category);
            res.status(201).json({
                success: true,
                data: {
                    storageKey: result.storageKey,
                    fileSize: result.fileSize,
                    mimeType: result.mimeType,
                    originalName: req.file.originalname
                }
            });
        }
        catch (err) {
            if (err.message.startsWith('INVALID_FILE_SIGNATURE')) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_FILE_SIGNATURE',
                        message: 'File content does not match expected binary media signature. Upload rejected.'
                    }
                });
                return;
            }
            if (err.message.startsWith('FILE_TOO_LARGE')) {
                res.status(413).json({
                    success: false,
                    error: { code: 'PAYLOAD_TOO_LARGE', message: err.message }
                });
                return;
            }
            if (err.message.startsWith('DISALLOWED_FILE_EXTENSION')) {
                res.status(400).json({
                    success: false,
                    error: { code: 'INVALID_EXTENSION', message: err.message }
                });
                return;
            }
            next(err);
        }
    }
    /**
     * Resumable chunked upload: Initiate
     */
    static async initiateChunked(req, res, next) {
        try {
            const { fileName, mimeType, fileSize } = req.body;
            const session = await upload_service_1.UploadService.initiateUploadSession(req.admin.adminId, fileName, mimeType, fileSize);
            res.status(201).json({
                success: true,
                data: session
            });
        }
        catch (err) {
            next(err);
        }
    }
    /**
      * Resumable chunked upload: Append chunk
     */
    static async appendChunk(req, res, next) {
        try {
            const { sessionId } = req.params;
            const chunkIndex = parseInt(req.query.chunkIndex, 10) || 0;
            if (!req.file || !req.file.buffer) {
                res.status(400).json({ success: false, error: { code: 'CHUNK_MISSING', message: 'No chunk data.' } });
                return;
            }
            const progress = await upload_service_1.UploadService.appendChunk(sessionId, req.admin.adminId, req.file.buffer, chunkIndex);
            res.status(200).json({
                success: true,
                data: progress
            });
        }
        catch (err) {
            if (err.message === 'FORBIDDEN_SESSION_OWNER') {
                res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'You do not own this upload session.' } });
                return;
            }
            if (err.message === 'CHUNK_SIZE_EXCEEDED' || err.message === 'UPLOAD_EXCEEDS_DECLARED_SIZE') {
                res.status(400).json({ success: false, error: { code: 'QUOTA_EXCEEDED', message: err.message } });
                return;
            }
            if (err.message.startsWith('INVALID_MAGIC_BYTES')) {
                res.status(400).json({
                    success: false,
                    error: { code: 'CORRUPTED_OR_MALICIOUS_CHUNK', message: err.message }
                });
                return;
            }
            if (err.message === 'UNEXPECTED_CHUNK_INDEX') {
                res.status(409).json({
                    success: false,
                    error: { code: 'UNEXPECTED_CHUNK_INDEX', message: 'Upload chunks must be sent once and in order.' }
                });
                return;
            }
            next(err);
        }
    }
    /**
     * Resumable chunked upload: Finalize and assemble
     */
    static async finalizeChunked(req, res, next) {
        try {
            const { sessionId } = req.params;
            const assembled = await upload_service_1.UploadService.finalizeUploadSession(sessionId, req.admin.adminId);
            res.status(200).json({
                success: true,
                data: assembled
            });
        }
        catch (err) {
            if (err.message === 'FORBIDDEN_SESSION_OWNER') {
                res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'You do not own this upload session.' } });
                return;
            }
            if (err.message === 'FILE_SIZE_MISMATCH') {
                res.status(400).json({ success: false, error: { code: 'FILE_SIZE_MISMATCH', message: 'Assembled file size does not match declared upload size.' } });
                return;
            }
            if (err.message.startsWith('INVALID_ASSEMBLED_FILE_SIGNATURE')) {
                res.status(400).json({
                    success: false,
                    error: { code: 'INVALID_FILE_SIGNATURE', message: 'The completed file is not a valid supported video.' }
                });
                return;
            }
            next(err);
        }
    }
    /**
     * Resumable chunked upload: Query status
     */
    static async getStatus(req, res, next) {
        try {
            const { sessionId } = req.params;
            const status = await upload_service_1.UploadService.getSessionStatus(sessionId, req.admin.adminId);
            res.status(200).json({
                success: true,
                data: status
            });
        }
        catch (err) {
            if (err.message === 'SESSION_NOT_FOUND') {
                res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Upload session not found.' } });
                return;
            }
            if (err.message === 'FORBIDDEN_SESSION_OWNER') {
                res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'You do not own this upload session.' } });
                return;
            }
            next(err);
        }
    }
    /**
     * Resumable chunked upload: Cancel and remove chunks
     */
    static async cancel(req, res, next) {
        try {
            const { sessionId } = req.params;
            const result = await upload_service_1.UploadService.cancelSession(sessionId, req.admin.adminId);
            res.status(200).json(result);
        }
        catch (err) {
            if (err.message === 'FORBIDDEN_SESSION_OWNER') {
                res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'You do not own this upload session.' } });
                return;
            }
            next(err);
        }
    }
}
exports.UploadController = UploadController;
