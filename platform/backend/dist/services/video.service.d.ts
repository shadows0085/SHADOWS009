import { VideoQueryFilters } from '../repositories/video.repository';
import { AuthenticatedAdminPayload, VideoStatus, VideoVisibility } from '../models/types';
export declare class VideoService {
    /**
     * Slug generator helper
     */
    private static generateSlug;
    /**
     * Create video metadata record
     */
    static createVideo(admin: AuthenticatedAdminPayload, data: {
        title: string;
        description?: string;
        storageKey: string;
        thumbnailKey?: string;
        mimeType: string;
        fileSize: number;
        duration?: number;
        status?: VideoStatus;
        visibility?: VideoVisibility;
    }, ipAddress?: string, userAgent?: string): Promise<{
        uploader: {
            id: string;
            email: string;
            name: string;
            role: string;
        };
    } & {
        status: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        fileSize: number;
        duration: number;
        slug: string;
        description: string | null;
        storageKey: string;
        thumbnailKey: string | null;
        mimeType: string;
        visibility: string;
        publishedAt: Date | null;
        uploadedBy: string;
    }>;
    static listVideos(filters: VideoQueryFilters): Promise<{
        videos: ({
            uploader: {
                id: string;
                email: string;
                name: string;
                role: string;
            };
        } & {
            status: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            fileSize: number;
            duration: number;
            slug: string;
            description: string | null;
            storageKey: string;
            thumbnailKey: string | null;
            mimeType: string;
            visibility: string;
            publishedAt: Date | null;
            uploadedBy: string;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    static getVideoById(id: string): Promise<{
        uploader: {
            id: string;
            email: string;
            name: string;
            role: string;
        };
    } & {
        status: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        fileSize: number;
        duration: number;
        slug: string;
        description: string | null;
        storageKey: string;
        thumbnailKey: string | null;
        mimeType: string;
        visibility: string;
        publishedAt: Date | null;
        uploadedBy: string;
    }>;
    /**
     * Update video with optimistic lock check
     */
    static updateVideo(id: string, admin: AuthenticatedAdminPayload, data: {
        title?: string;
        description?: string | null;
        thumbnailKey?: string | null;
        status?: VideoStatus;
        visibility?: VideoVisibility;
        duration?: number;
    }, ipAddress?: string, userAgent?: string): Promise<{
        uploader: {
            id: string;
            email: string;
            name: string;
            role: string;
        };
    } & {
        status: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        fileSize: number;
        duration: number;
        slug: string;
        description: string | null;
        storageKey: string;
        thumbnailKey: string | null;
        mimeType: string;
        visibility: string;
        publishedAt: Date | null;
        uploadedBy: string;
    }>;
    /**
     * Delete video (Transactionally removes DB record first, then underlying storage asset)
     */
    static deleteVideo(id: string, admin: AuthenticatedAdminPayload, ipAddress?: string, userAgent?: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
    /**
     * Generate short-lived HMAC-SHA256 signed streaming ticket
     */
    static generateStreamTicket(videoId: string, admin: AuthenticatedAdminPayload, ipAddress?: string, userAgent?: string): Promise<{
        ticket: string;
        streamUrl: string;
        expiresAt: number;
        ttlSeconds: number;
    }>;
    /**
     * Verify ticket and serve byte-range stream for HTML5 video players
     */
    static getVideoStream(ticket: string, clientIp?: string, userAgent?: string): Promise<{
        filePath: string;
        fileSize: number;
        mimeType: string;
        video: {
            uploader: {
                id: string;
                email: string;
                name: string;
                role: string;
            };
        } & {
            status: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            fileSize: number;
            duration: number;
            slug: string;
            description: string | null;
            storageKey: string;
            thumbnailKey: string | null;
            mimeType: string;
            visibility: string;
            publishedAt: Date | null;
            uploadedBy: string;
        };
    }>;
    static getDashboardMetrics(): Promise<{
        totalVideos: number;
        publishedVideos: number;
        draftVideos: number;
        archivedVideos: number;
        totalStorageBytes: number;
    }>;
}
