import crypto from 'crypto';
import { VideoRepository, VideoQueryFilters } from '../repositories/video.repository';
import { AuditRepository } from '../repositories/audit.repository';
import { storageService } from './storage.service';
import { CryptoUtils } from '../security/crypto';
import { env } from '../config/env';
import { AuthenticatedAdminPayload, VideoStatus, VideoVisibility, StreamTicketPayload } from '../models/types';

export class VideoService {
  /**
   * Slug generator helper
   */
  private static generateSlug(title: string): string {
    const base = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const suffix = crypto.randomBytes(4).toString('hex');
    return `${base || 'video'}-${suffix}`;
  }

  /**
   * Create video metadata record
   */
  static async createVideo(
    admin: AuthenticatedAdminPayload,
    data: {
      title: string;
      description?: string;
      storageKey: string;
      thumbnailKey?: string;
      mimeType: string;
      fileSize: number;
      duration?: number;
      status?: VideoStatus;
      visibility?: VideoVisibility;
    },
    ipAddress?: string,
    userAgent?: string
  ) {
    const slug = this.generateSlug(data.title);

    let video;
    try {
      video = await VideoRepository.create({
        ...data,
        slug,
        uploadedBy: admin.adminId
      });
    } catch (err) {
      // Rollback uploaded file if DB record creation fails
      if (data.storageKey) {
        await storageService.delete(data.storageKey).catch(() => {});
      }
      if (data.thumbnailKey) {
        await storageService.delete(data.thumbnailKey).catch(() => {});
      }
      throw err;
    }

    await AuditRepository.record({
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

  static async listVideos(filters: VideoQueryFilters) {
    return VideoRepository.list(filters);
  }

  static async getVideoById(id: string) {
    const video = await VideoRepository.findById(id);
    if (!video) throw new Error('VIDEO_NOT_FOUND');
    return video;
  }

  /**
   * Update video with optimistic lock check
   */
  static async updateVideo(
    id: string,
    admin: AuthenticatedAdminPayload,
    data: {
      title?: string;
      description?: string | null;
      thumbnailKey?: string | null;
      status?: VideoStatus;
      visibility?: VideoVisibility;
      duration?: number;
    },
    ipAddress?: string,
    userAgent?: string
  ) {
    const existing = await VideoRepository.findById(id);
    if (!existing) throw new Error('VIDEO_NOT_FOUND');

    // Role-based privilege check: Editor can only update videos, not publish or archive if not permitted
    if (admin.role === 'EDITOR' && data.status && data.status !== 'DRAFT') {
      throw new Error('FORBIDDEN_STATUS_CHANGE');
    }

    let publishedAt = existing.publishedAt;
    if (data.status === 'PUBLISHED' && existing.status !== 'PUBLISHED') {
      publishedAt = new Date();
    }

    const updated = await VideoRepository.update(id, {
      ...data,
      publishedAt
    });

    await AuditRepository.record({
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
  static async deleteVideo(
    id: string,
    admin: AuthenticatedAdminPayload,
    ipAddress?: string,
    userAgent?: string
  ) {
    const video = await VideoRepository.findById(id);
    if (!video) throw new Error('VIDEO_NOT_FOUND');

    // 1. Delete DB record first: If this fails, file remains intact in storage and data is consistent
    await VideoRepository.delete(id);

    // 2. Remove files from storage after DB deletion succeeds
    if (video.storageKey) {
      await storageService.delete(video.storageKey).catch(() => {});
    }
    if (video.thumbnailKey) {
      await storageService.delete(video.thumbnailKey).catch(() => {});
    }

    await AuditRepository.record({
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
  static async generateStreamTicket(
    videoId: string,
    admin: AuthenticatedAdminPayload,
    ipAddress: string = '127.0.0.1',
    userAgent: string = 'unknown'
  ): Promise<{ ticket: string; streamUrl: string; expiresAt: number; ttlSeconds: number }> {
    const video = await VideoRepository.findById(videoId);
    if (!video) throw new Error('VIDEO_NOT_FOUND');

    const now = Date.now();
    const ttlSeconds = env.STREAM_TICKET_TTL_SECONDS;
    const expiresAt = now + ttlSeconds * 1000;

    const clientHash = crypto
      .createHash('sha256')
      .update(`${ipAddress}::${userAgent}`)
      .digest('hex')
      .slice(0, 16);

    const payload: StreamTicketPayload = {
      videoId: video.id,
      adminId: admin.adminId,
      role: admin.role,
      nonce: crypto.randomBytes(12).toString('hex'),
      issuedAt: now,
      expiresAt,
      clientHash
    };

    const ticket = CryptoUtils.signStreamTicket(payload);

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
  static async getVideoStream(
    ticket: string,
    clientIp: string = '127.0.0.1',
    userAgent: string = 'unknown'
  ) {
    const verification = CryptoUtils.verifyStreamTicket<StreamTicketPayload>(ticket);
    if (!verification.valid || !verification.payload) {
      throw new Error(`INVALID_TICKET:${verification.error}`);
    }

    const payload = verification.payload;
    if (Date.now() > payload.expiresAt) {
      throw new Error('TICKET_EXPIRED');
    }

    // Verify cryptographic client binding (IP + User Agent) to prevent replay/leakage
    const expectedClientHash = crypto
      .createHash('sha256')
      .update(`${clientIp}::${userAgent}`)
      .digest('hex')
      .slice(0, 16);

    const clientHashBuf = Buffer.from(payload.clientHash || '', 'utf8');
    const expectedHashBuf = Buffer.from(expectedClientHash, 'utf8');
    if (
      clientHashBuf.length !== expectedHashBuf.length ||
      !crypto.timingSafeEqual(clientHashBuf, expectedHashBuf)
    ) {
      throw new Error('INVALID_TICKET:CLIENT_MISMATCH');
    }

    const video = await VideoRepository.findById(payload.videoId);
    if (!video) throw new Error('VIDEO_NOT_FOUND');

    const filePath = storageService.getAbsolutePath(video.storageKey);
    const fileSize = await storageService.getFileSize(video.storageKey);

    return {
      filePath,
      fileSize,
      mimeType: video.mimeType,
      video
    };
  }

  static async getDashboardMetrics() {
    return VideoRepository.getMetrics();
  }
}
