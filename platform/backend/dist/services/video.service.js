"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const video_repository_1 = require("../repositories/video.repository");
const audit_repository_1 = require("../repositories/audit.repository");
const storage_service_1 = require("./storage.service");
const crypto_2 = require("../security/crypto");
const env_1 = require("../config/env");
class VideoService {
    /**
     * Slug generator helper
     */
    static generateSlug(title) {
        const base = title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
        const suffix = crypto_1.default.randomBytes(4).toString('hex');
        return `${base || 'video'}-${suffix}`;
    }
    /**
     * Create video metadata record
     */
    static async createVideo(admin, data, ipAddress, userAgent) {
        const slug = this.generateSlug(data.title);
        let video;
        try {
            video = await video_repository_1.VideoRepository.create({
                ...data,
                slug,
                uploadedBy: admin.adminId
            });
        }
        catch (err) {
            // Rollback uploaded file if DB record creation fails
            if (data.storageKey) {
                await storage_service_1.storageService.delete(data.storageKey).catch(() => { });
            }
            if (data.thumbnailKey) {
                await storage_service_1.storageService.delete(data.thumbnailKey).catch(() => { });
            }
            throw err;
        }
        await audit_repository_1.AuditRepository.record({
            adminId: admin.adminId,
            action: 'VIDEO_CREATED',
            resourceType: 'Video',
            resourceId: video.id,
            ipAddress,
            userAgent,
            metadata: { title: video.title, slug: video.slug, storageKey: video.storageKey }
        });
        return video;
    }
    static async listVideos(filters) {
        return video_repository_1.VideoRepository.list(filters);
    }
    static async getVideoById(id) {
        const video = await video_repository_1.VideoRepository.findById(id);
        if (!video)
            throw new Error('VIDEO_NOT_FOUND');
        return video;
    }
    /**
     * Update video with optimistic lock check
     */
    static async updateVideo(id, admin, data, ipAddress, userAgent) {
        const existing = await video_repository_1.VideoRepository.findById(id);
        if (!existing)
            throw new Error('VIDEO_NOT_FOUND');
        // Role-based privilege check: Editor can only update videos, not publish or archive if not permitted
        if (admin.role === 'EDITOR' && data.status && data.status !== 'DRAFT') {
            throw new Error('FORBIDDEN_STATUS_CHANGE');
        }
        let publishedAt = existing.publishedAt;
        if (data.status === 'PUBLISHED' && existing.status !== 'PUBLISHED') {
            publishedAt = new Date();
        }
        const updated = await video_repository_1.VideoRepository.update(id, {
            ...data,
            publishedAt
        });
        await audit_repository_1.AuditRepository.record({
            adminId: admin.adminId,
            action: 'VIDEO_UPDATED',
            resourceType: 'Video',
            resourceId: updated.id,
            ipAddress,
            userAgent,
            metadata: { changedFields: Object.keys(data), newStatus: updated.status }
        });
        return updated;
    }
    /**
     * Delete video (Transactionally removes DB record first, then underlying storage asset)
     */
    static async deleteVideo(id, admin, ipAddress, userAgent) {
        const video = await video_repository_1.VideoRepository.findById(id);
        if (!video)
            throw new Error('VIDEO_NOT_FOUND');
        // 1. Delete DB record first: If this fails, file remains intact in storage and data is consistent
        await video_repository_1.VideoRepository.delete(id);
        // 2. Remove files from storage after DB deletion succeeds
        if (video.storageKey) {
            await storage_service_1.storageService.delete(video.storageKey).catch(() => { });
        }
        if (video.thumbnailKey) {
            await storage_service_1.storageService.delete(video.thumbnailKey).catch(() => { });
        }
        await audit_repository_1.AuditRepository.record({
            adminId: admin.adminId,
            action: 'VIDEO_DELETED',
            resourceType: 'Video',
            resourceId: id,
            ipAddress,
            userAgent,
            metadata: { title: video.title, storageKey: video.storageKey }
        });
        return { id, deleted: true };
    }
    /**
     * Generate short-lived HMAC-SHA256 signed streaming ticket
     */
    static async generateStreamTicket(videoId, admin, ipAddress = '127.0.0.1', userAgent = 'unknown') {
        const video = await video_repository_1.VideoRepository.findById(videoId);
        if (!video)
            throw new Error('VIDEO_NOT_FOUND');
        const now = Date.now();
        const ttlSeconds = env_1.env.STREAM_TICKET_TTL_SECONDS;
        const expiresAt = now + ttlSeconds * 1000;
        const clientHash = crypto_1.default
            .createHash('sha256')
            .update(`${ipAddress}::${userAgent}`)
            .digest('hex')
            .slice(0, 16);
        const payload = {
            videoId: video.id,
            adminId: admin.adminId,
            role: admin.role,
            nonce: crypto_1.default.randomBytes(12).toString('hex'),
            issuedAt: now,
            expiresAt,
            clientHash
        };
        const ticket = crypto_2.CryptoUtils.signStreamTicket(payload);
        return {
            ticket,
            streamUrl: `/api/v1/videos/stream/${ticket}`,
            expiresAt,
            ttlSeconds
        };
    }
    /**
     * Verify ticket and serve byte-range stream for HTML5 video players
     */
    static async getVideoStream(ticket, clientIp = '127.0.0.1', userAgent = 'unknown') {
        const verification = crypto_2.CryptoUtils.verifyStreamTicket(ticket);
        if (!verification.valid || !verification.payload) {
            throw new Error(`INVALID_TICKET:${verification.error}`);
        }
        const payload = verification.payload;
        if (Date.now() > payload.expiresAt) {
            throw new Error('TICKET_EXPIRED');
        }
        // Verify cryptographic client binding (IP + User Agent) to prevent replay/leakage
        const expectedClientHash = crypto_1.default
            .createHash('sha256')
            .update(`${clientIp}::${userAgent}`)
            .digest('hex')
            .slice(0, 16);
        const clientHashBuf = Buffer.from(payload.clientHash || '', 'utf8');
        const expectedHashBuf = Buffer.from(expectedClientHash, 'utf8');
        if (clientHashBuf.length !== expectedHashBuf.length ||
            !crypto_1.default.timingSafeEqual(clientHashBuf, expectedHashBuf)) {
            throw new Error('INVALID_TICKET:CLIENT_MISMATCH');
        }
        const video = await video_repository_1.VideoRepository.findById(payload.videoId);
        if (!video)
            throw new Error('VIDEO_NOT_FOUND');
        const filePath = storage_service_1.storageService.getAbsolutePath(video.storageKey);
        const fileSize = await storage_service_1.storageService.getFileSize(video.storageKey);
        return {
            filePath,
            fileSize,
            mimeType: video.mimeType,
            video
        };
    }
    static async getDashboardMetrics() {
        return video_repository_1.VideoRepository.getMetrics();
    }
}
exports.VideoService = VideoService;
