"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenRepository = void 0;
const prisma_client_1 = require("./prisma.client");
class TokenRepository {
    static async create(data) {
        return prisma_client_1.prisma.refreshToken.create({
            data: {
                adminId: data.adminId,
                tokenHash: data.tokenHash,
                expiresAt: data.expiresAt,
                ipAddress: data.ipAddress,
                userAgent: data.userAgent
            }
        });
    }
    static async findByTokenHash(tokenHash) {
        return prisma_client_1.prisma.refreshToken.findUnique({
            where: { tokenHash },
            include: { admin: true }
        });
    }
    static async revoke(tokenHash) {
        return prisma_client_1.prisma.refreshToken.update({
            where: { tokenHash },
            data: { revokedAt: new Date() }
        });
    }
    static async revokeAllForAdmin(adminId) {
        return prisma_client_1.prisma.refreshToken.updateMany({
            where: {
                adminId,
                revokedAt: null
            },
            data: { revokedAt: new Date() }
        });
    }
    static async listActiveForAdmin(adminId) {
        return prisma_client_1.prisma.refreshToken.findMany({
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
        return prisma_client_1.prisma.refreshToken.deleteMany({
            where: {
                OR: [
                    { expiresAt: { lt: new Date() } },
                    { revokedAt: { not: null } }
                ]
            }
        });
    }
}
exports.TokenRepository = TokenRepository;
