import { prisma } from './prisma.client';

export class AuditRepository {
  static async record(data: {
    adminId?: string | null;
    action: string;
    resourceType?: string;
    resourceId?: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, any>;
  }) {
    return prisma.auditLog.create({
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

  static async list(params: {
    page?: number;
    limit?: number;
    adminId?: string;
    action?: string;
  } = {}) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 25));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.adminId) where.adminId = params.adminId;
    if (params.action) where.action = params.action;

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
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
        } catch {
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
