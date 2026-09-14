import { VideoStatus, VideoVisibility } from '../models/types';
export interface VideoQueryFilters {
    page?: number;
    limit?: number;
    search?: string;
    status?: VideoStatus;
    visibility?: VideoVisibility;
    uploadedBy?: string;
    sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'fileSize' | 'duration';
    sortOrder?: 'asc' | 'desc';
}
export declare class VideoRepository {
    static create(data: {
        title: string;
        slug: string;
        description?: string;
        storageKey: string;
        thumbnailKey?: string;
        mimeType: string;
        fileSize: number;
        duration?: number;
        uploadedBy: string;
        status?: VideoStatus;
        visibility?: VideoVisibility;
    }): Promise<{
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
    static findById(id: string): Promise<({
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
    }) | null>;
    static findBySlug(slug: string): Promise<{
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
    } | null>;
    static findByStorageKey(storageKey: string): Promise<{
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
    } | null>;
    static list(filters?: VideoQueryFilters): Promise<{
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
    static update(id: string, data: Partial<{
        title: string;
        slug: string;
        description: string | null;
        thumbnailKey: string | null;
        status: VideoStatus;
        visibility: VideoVisibility;
        publishedAt: Date | null;
        duration: number;
    }>): Promise<{
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
    static delete(id: string): Promise<{
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
    static getMetrics(): Promise<{
        totalVideos: number;
        publishedVideos: number;
        draftVideos: number;
        archivedVideos: number;
        totalStorageBytes: number;
    }>;
}
