"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoController = void 0;
const fs_1 = __importDefault(require("fs"));
const video_service_1 = require("../services/video.service");
class VideoController {
    static async list(req, res, next) {
        try {
            const filters = req.query;
            const result = await video_service_1.VideoService.listVideos(filters);
            res.status(200).json({
                success: true,
                data: result.videos,
                meta: result.meta
            });
        }
        catch (err) {
            next(err);
        }
    }
    static async getById(req, res, next) {
        try {
            const { id } = req.params;
            const video = await video_service_1.VideoService.getVideoById(id);
            res.status(200).json({
                success: true,
                data: video
            });
        }
        catch (err) {
            if (err.message === 'VIDEO_NOT_FOUND') {
                res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Video not found.' } });
                return;
            }
            next(err);
        }
    }
    static async create(req, res, next) {
        try {
            const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            const ua = req.headers['user-agent'];
            const video = await video_service_1.VideoService.createVideo(req.admin, req.body, ip, ua);
            res.status(201).json({
                success: true,
                data: video
            });
        }
        catch (err) {
            next(err);
        }
    }
    static async update(req, res, next) {
        try {
            const { id } = req.params;
            const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            const ua = req.headers['user-agent'];
            const updated = await video_service_1.VideoService.updateVideo(id, req.admin, req.body, ip, ua);
            res.status(200).json({
                success: true,
                data: updated
            });
        }
        catch (err) {
            if (err.message === 'VIDEO_NOT_FOUND') {
                res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Video not found.' } });
                return;
            }
            if (err.message === 'FORBIDDEN_STATUS_CHANGE') {
                res.status(403).json({
                    success: false,
                    error: { code: 'FORBIDDEN', message: 'Editors cannot publish or archive content.' }
                });
                return;
            }
            next(err);
        }
    }
    static async updateStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            const ua = req.headers['user-agent'];
            const updated = await video_service_1.VideoService.updateVideo(id, req.admin, { status }, ip, ua);
            res.status(200).json({
                success: true,
                data: updated
            });
        }
        catch (err) {
            next(err);
        }
    }
    static async delete(req, res, next) {
        try {
            const id = req.params.id;
            const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
            const ua = req.headers['user-agent'] || 'unknown';
            const result = await video_service_1.VideoService.deleteVideo(id, req.admin, ip, ua);
            res.status(200).json({
                success: true,
                data: result
            });
        }
        catch (err) {
            if (err.message === 'VIDEO_NOT_FOUND') {
                res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Video not found.' } });
                return;
            }
            next(err);
        }
    }
    /**
     * Request signed stream ticket for private video viewing
     */
    static async getStreamTicket(req, res, next) {
        try {
            const { id } = req.params;
            const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
            const ua = req.headers['user-agent'] || 'unknown';
            const ticket = await video_service_1.VideoService.generateStreamTicket(id, req.admin, ip, ua);
            res.status(200).json({
                success: true,
                data: ticket
            });
        }
        catch (err) {
            if (err.message === 'VIDEO_NOT_FOUND') {
                res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Video not found.' } });
                return;
            }
            next(err);
        }
    }
    /**
     * Byte-Range streaming endpoint with short-lived HMAC signed ticket verification
     */
    static async streamMedia(req, res, next) {
        try {
            const { ticket } = req.params;
            const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
            const ua = req.headers['user-agent'] || 'unknown';
            const { filePath, fileSize, mimeType } = await video_service_1.VideoService.getVideoStream(ticket, ip, ua);
            const range = req.headers.range;
            if (!range) {
                // Full content request
                res.writeHead(200, {
                    'Content-Length': fileSize,
                    'Content-Type': mimeType,
                    'Accept-Ranges': 'bytes',
                    'Cache-Control': 'private, no-cache, no-store, must-revalidate',
                    'X-Content-Type-Options': 'nosniff'
                });
                fs_1.default.createReadStream(filePath).pipe(res);
                return;
            }
            // Partial Content Range request (RFC 7233)
            // Strict validation: must match bytes=(\d*)-(\d*)
            const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
            if (!match) {
                res.status(416).set('Content-Range', `bytes */${fileSize}`).end();
                return;
            }
            const startRaw = match[1];
            const endRaw = match[2];
            let start = startRaw ? parseInt(startRaw, 10) : NaN;
            let end = endRaw ? parseInt(endRaw, 10) : NaN;
            if (isNaN(start) && isNaN(end)) {
                res.status(416).set('Content-Range', `bytes */${fileSize}`).end();
                return;
            }
            if (isNaN(start)) {
                // Suffix byte range: bytes=-500 means last 500 bytes
                const suffixLength = end;
                if (suffixLength <= 0) {
                    res.status(416).set('Content-Range', `bytes */${fileSize}`).end();
                    return;
                }
                start = Math.max(0, fileSize - suffixLength);
                end = fileSize - 1;
            }
            else if (isNaN(end)) {
                // Prefix byte range: bytes=500-
                end = fileSize - 1;
            }
            if (start > end || start >= fileSize || end >= fileSize || start < 0) {
                res.status(416).set('Content-Range', `bytes */${fileSize}`).end();
                return;
            }
            const chunkSize = end - start + 1;
            const stream = fs_1.default.createReadStream(filePath, { start, end });
            res.writeHead(206, {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunkSize,
                'Content-Type': mimeType,
                'Cache-Control': 'private, no-cache, no-store, must-revalidate',
                'X-Content-Type-Options': 'nosniff'
            });
            stream.pipe(res);
        }
        catch (err) {
            if (err.message.startsWith('INVALID_TICKET') || err.message === 'TICKET_EXPIRED') {
                res.status(403).json({
                    success: false,
                    error: { code: 'ACCESS_DENIED', message: 'Streaming ticket is invalid or has expired.' }
                });
                return;
            }
            if (err.message === 'VIDEO_NOT_FOUND') {
                res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Asset not found.' } });
                return;
            }
            next(err);
        }
    }
    static async getMetrics(req, res, next) {
        try {
            const metrics = await video_service_1.VideoService.getDashboardMetrics();
            res.status(200).json({
                success: true,
                data: metrics
            });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.VideoController = VideoController;
