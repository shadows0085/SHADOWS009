import { prisma } from './prisma.client';
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

export class VideoRepository {
  static async create(data: {
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
  }) {
    return prisma.video.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        storageKey: data.storageKey,
        thumbnailKey: data.thumbnailKey,
        mimeType: data.mimeType,
        fileSize: data.fileSize,
        duration: data.duration ?? 0,
        uploadedBy: data.uploadedBy,
        status: data.status || 'DRAFT',
        visibility: data.visibility || 'PRIVATE'
      },
      include: {
        uploader: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    });
  }

  static async findById(id: string) {
    return prisma.video.findUnique({
      where: { id },
      include: {
        uploader: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    });
  }

  static async findBySlug(slug: string) {
    return prisma.video.findUnique({
      where: { slug }
    });
  }

  static async findByStorageKey(storageKey: string) {
    return prisma.video.findUnique({
      where: { storageKey }
    });
  }

  static async list(filters: VideoQueryFilters = {}) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.visibility) {
      where.visibility = filters.visibility;
    }

    if (filters.uploadedBy) {
      where.uploadedBy = filters.uploadedBy;
    }

    if (filters.search) {
      const term = filters.search.trim();
      where.OR = [
        { title: { contains: term } },
        { description: { contains: term } },
        { slug: { contains: term } }
      ];
    }

    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder || 'desc';

    const [total, videos] = await Promise.all([
      prisma.video.count({ where }),
      prisma.video.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          uploader: {
            select: { id: true, name: true, email: true, role: true }
          }
        }
      })
    ]);

    return {
      videos,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async update(
    id: string,
    data: Partial<{
      title: string;
      slug: string;
      description: string | null;
      thumbnailKey: string | null;
      status: VideoStatus;
      visibility: VideoVisibility;
      publishedAt: Date | null;
      duration: number;
    }>
  ) {
    return prisma.video.update({
      where: { id },
      data,
      include: {
        uploader: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    });
  }

  static async delete(id: string) {
    return prisma.video.delete({
      where: { id }
    });
  }

  static async getMetrics() {
    const [total, published, drafts, archived, totalStorage] = await Promise.all([
      prisma.video.count(),
      prisma.video.count({ where: { status: 'PUBLISHED' } }),
      prisma.video.count({ where: { status: 'DRAFT' } }),
      prisma.video.count({ where: { status: 'ARCHIVED' } }),
      prisma.video.aggregate({
        _sum: { fileSize: true }
      })
    ]);

    return {
      totalVideos: total,
      publishedVideos: published,
      draftVideos: drafts,
      archivedVideos: archived,
      totalStorageBytes: totalStorage._sum.fileSize || 0
    };
  }
}
