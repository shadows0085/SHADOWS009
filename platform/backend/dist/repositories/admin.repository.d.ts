import { AdminRole } from '../models/types';
export declare class AdminRepository {
    static findByEmail(identifier: string): Promise<{
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
    } | null>;
    static findById(id: string): Promise<{
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
    } | null>;
    static countActiveSuperAdmins(): Promise<number>;
    static listAll(): Promise<{
        id: string;
        email: string;
        name: string;
        role: string;
        isActive: boolean;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    static create(data: {
        email: string;
        passwordHash: string;
        name: string;
        role?: AdminRole;
        isActive?: boolean;
    }): Promise<{
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
    }>;
    static update(id: string, data: Partial<{
        name: string;
        email: string;
        role: AdminRole;
        isActive: boolean;
        passwordHash: string;
    }>): Promise<{
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
    }>;
    /**
     * Apply an administrator update while holding the count-and-mutate operation
     * in one database transaction. The controller's earlier check improves the
     * response message, but this is the authoritative protection against two
     * concurrent requests demoting/deactivating the final active super admin.
     */
    static updateWithSuperAdminGuard(id: string, data: Partial<{
        name: string;
        email: string;
        role: AdminRole;
        isActive: boolean;
        passwordHash: string;
    }>): Promise<{
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
    }>;
    static updatePassword(id: string, passwordHash: string): Promise<{
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
    }>;
    static incrementFailedAttempts(id: string, maxAttempts: number, lockoutMinutes: number): Promise<{
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
    } | null>;
    static recordSuccessfulLogin(id: string): Promise<{
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
    }>;
    static delete(id: string): Promise<{
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
    }>;
    static deleteWithSuperAdminGuard(id: string): Promise<{
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
    }>;
}
