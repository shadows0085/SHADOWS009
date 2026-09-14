import { prisma } from './prisma.client';

export class TokenRepository {
  static async create(data: {
    adminId: string;
    tokenHash: string;
    expiresAt: Date;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return prisma.refreshToken.create({
      data: {
        adminId: data.adminId,
        tokenHash: data.tokenHash,
        expiresAt: data.expiresAt,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent
      }
    });
  }

  static async findByTokenHash(tokenHash: string) {
    return prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { admin: true }
    });
  }

  static async revoke(tokenHash: string) {
    return prisma.refreshToken.update({
      where: { tokenHash },
      data: { revokedAt: new Date() }
    });
  }

  static async revokeAllForAdmin(adminId: string) {
    return prisma.refreshToken.updateMany({
      where: {
        adminId,
        revokedAt: null
      },
      data: { revokedAt: new Date() }
    });
  }

  static async listActiveForAdmin(adminId: string) {
    return prisma.refreshToken.findMany({
      where: {
        adminId,
        revokedAt: null,
        expiresAt: { gt: new Date() }
      },
      select: {
        id: true,
        createdAt: true,
        expiresAt: true,
        ipAddress: true,
        userAgent: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async cleanupExpired() {
    return prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { revokedAt: { not: null } }
        ]
      }
    });
  }
}
