"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditRepository = void 0;
const prisma_client_1 = require("./prisma.client");
class AuditRepository {
    static async record(data) {
        return prisma_client_1.prisma.auditLog.create({
            data: {
                adminId: data.adminId,
                action: data.action,
                resourceType: data.resourceType,
                resourceId: data.resourceId,
                ipAddress: data.ipAddress,
                userAgent: data.userAgent,
                metadata: data.metadata ? JSON.stringify(data.metadata) : null
            }
        });
    }
    static async list(params = {}) {
        const page = Math.max(1, params.page || 1);
        const limit = Math.min(100, Math.max(1, params.limit || 25));
        const skip = (page - 1) * limit;
        const where = {};
        if (params.adminId)
            where.adminId = params.adminId;
        if (params.action)
            where.action = params.action;
        const [total, logs] = await Promise.all([
            prisma_client_1.prisma.auditLog.count({ where }),
            prisma_client_1.prisma.auditLog.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    admin: {
                        select: { id: true, name: true, email: true, role: true }
                    }
                }
            })
        ]);
        const formatted = logs.map(l => {
            let parsedMeta = null;
            if (l.metadata) {
                try {
                    parsedMeta = JSON.parse(l.metadata);
                }
                catch {
                    parsedMeta = l.metadata;
                }
            }
            return {
                ...l,
                metadata: parsedMeta
            };
        });
        return {
            logs: formatted,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
}
exports.AuditRepository = AuditRepository;
