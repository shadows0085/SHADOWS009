export declare class TokenRepository {
    static create(data: {
        adminId: string;
        tokenHash: string;
        expiresAt: Date;
        ipAddress?: string;
        userAgent?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        tokenHash: string;
        expiresAt: Date;
        revokedAt: Date | null;
        ipAddress: string | null;
        userAgent: string | null;
        adminId: string;
    }>;
    static findByTokenHash(tokenHash: string): Promise<({
        admin: {
            passwordHash: string;
            id: string;
            email: string;
            name: string;
            role: string;
            isActive: boolean;
            failedLoginAttempts: number;
            lockedUntil: Date | null;
            lastLoginAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        tokenHash: string;
        expiresAt: Date;
        revokedAt: Date | null;
        ipAddress: string | null;
        userAgent: string | null;
        adminId: string;
    }) | null>;
    static revoke(tokenHash: string): Promise<{
        id: string;
        createdAt: Date;
        tokenHash: string;
        expiresAt: Date;
        revokedAt: Date | null;
        ipAddress: string | null;
        userAgent: string | null;
        adminId: string;
    }>;
    static revokeAllForAdmin(adminId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    static listActiveForAdmin(adminId: string): Promise<{
        id: string;
        createdAt: Date;
        expiresAt: Date;
        ipAddress: string | null;
        userAgent: string | null;
    }[]>;
    static cleanupExpired(): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
