"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoRepository = void 0;
const prisma_client_1 = require("./prisma.client");
class VideoRepository {
    static async create(data) {
        return prisma_client_1.prisma.video.create({
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
    static async findById(id) {
        return prisma_client_1.prisma.video.findUnique({
            where: { id },
            include: {
                uploader: {
                    select: { id: true, name: true, email: true, role: true }
                }
            }
        });
    }
    static async findBySlug(slug) {
        return prisma_client_1.prisma.video.findUnique({
            where: { slug }
        });
    }
    static async findByStorageKey(storageKey) {
        return prisma_client_1.prisma.video.findUnique({
            where: { storageKey }
        });
    }
    static async list(filters = {}) {
        const page = Math.max(1, filters.page || 1);
        const limit = Math.min(100, Math.max(1, filters.limit || 20));
        const skip = (page - 1) * limit;
        const where = {};
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
            prisma_client_1.prisma.video.count({ where }),
            prisma_client_1.prisma.video.findMany({
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
    static async update(id, data) {
        return prisma_client_1.prisma.video.update({
            where: { id },
            data,
            include: {
                uploader: {
                    select: { id: true, name: true, email: true, role: true }
                }
            }
        });
    }
    static async delete(id) {
        return prisma_client_1.prisma.video.delete({
            where: { id }
        });
    }
    static async getMetrics() {
        const [total, published, drafts, archived, totalStorage] = await Promise.all([
            prisma_client_1.prisma.video.count(),
            prisma_client_1.prisma.video.count({ where: { status: 'PUBLISHED' } }),
            prisma_client_1.prisma.video.count({ where: { status: 'DRAFT' } }),
            prisma_client_1.prisma.video.count({ where: { status: 'ARCHIVED' } }),
            prisma_client_1.prisma.video.aggregate({
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
exports.VideoRepository = VideoRepository;
