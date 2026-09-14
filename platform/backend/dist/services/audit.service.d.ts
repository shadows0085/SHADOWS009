export declare class AuditService {
    static record(params: {
        adminId?: string | null;
        action: string;
        resourceType?: string;
        resourceId?: string;
        ipAddress?: string;
        userAgent?: string;
        metadata?: Record<string, any>;
    }): Promise<{
        id: string;
        createdAt: Date;
        ipAddress: string | null;
        userAgent: string | null;
        adminId: string | null;
        action: string;
        resourceType: string | null;
        resourceId: string | null;
        metadata: string | null;
    }>;
    static listAuditLogs(params: {
        page?: number;
        limit?: number;
        adminId?: string;
        action?: string;
    }): Promise<{
        logs: {
            metadata: any;
            admin: {
                id: string;
                email: string;
                name: string;
                role: string;
            } | null;
            id: string;
            createdAt: Date;
            ipAddress: string | null;
            userAgent: string | null;
            adminId: string | null;
            action: string;
            resourceType: string | null;
            resourceId: string | null;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
}
