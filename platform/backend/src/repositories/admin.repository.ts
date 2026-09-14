import { prisma } from './prisma.client';
import { AdminRole } from '../models/types';

export class AdminRepository {
  static async findByEmail(identifier: string) {
    const clean = identifier.toLowerCase().trim();
    return prisma.admin.findUnique({
      where: { email: clean }
    });
  }

  static async findById(id: string) {
    return prisma.admin.findUnique({
      where: { id }
    });
  }

  static async countActiveSuperAdmins(): Promise<number> {
    return prisma.admin.count({
      where: {
        role: 'SUPER_ADMIN',
        isActive: true
      }
    });
  }

  static async listAll() {
    return prisma.admin.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async create(data: {
    email: string;
    passwordHash: string;
    name: string;
    role?: AdminRole;
    isActive?: boolean;
  }) {
    return prisma.admin.create({
      data: {
        email: data.email.toLowerCase().trim(),
        passwordHash: data.passwordHash,
        name: data.name,
        role: data.role || 'EDITOR',
        isActive: data.isActive ?? true
      }
    });
  }

  static async update(id: string, data: Partial<{
    name: string;
    email: string;
    role: AdminRole;
    isActive: boolean;
    passwordHash: string;
  }>) {
    if (data.email) {
      data.email = data.email.toLowerCase().trim();
    }
    return prisma.admin.update({
      where: { id },
      data
    });
  }

  /**
   * Apply an administrator update while holding the count-and-mutate operation
   * in one database transaction. The controller's earlier check improves the
   * response message, but this is the authoritative protection against two
   * concurrent requests demoting/deactivating the final active super admin.
   */
  static async updateWithSuperAdminGuard(id: string, data: Partial<{
    name: string;
    email: string;
    role: AdminRole;
    isActive: boolean;
    passwordHash: string;
  }>) {
    return prisma.$transaction(async tx => {
      const current = await tx.admin.findUnique({ where: { id } });
      if (!current) throw new Error('ADMIN_NOT_FOUND');

      const removesActiveSuperAdmin =
        current.role === 'SUPER_ADMIN' &&
        current.isActive &&
        (data.role !== undefined && data.role !== 'SUPER_ADMIN' || data.isActive === false);

      if (removesActiveSuperAdmin) {
        const activeSuperCount = await tx.admin.count({
          where: { role: 'SUPER_ADMIN', isActive: true }
        });
        if (activeSuperCount <= 1) throw new Error('LAST_SUPER_ADMIN_PROTECTED');
      }

      if (data.email) data.email = data.email.toLowerCase().trim();
      return tx.admin.update({ where: { id }, data });
    });
  }

  static async updatePassword(id: string, passwordHash: string) {
    return prisma.admin.update({
      where: { id },
      data: { passwordHash }
    });
  }

  static async incrementFailedAttempts(id: string, maxAttempts: number, lockoutMinutes: number) {
    const admin = await prisma.admin.findUnique({ where: { id } });
    if (!admin) return null;

    const newAttempts = admin.failedLoginAttempts + 1;
    const shouldLock = newAttempts >= maxAttempts;
    const lockedUntil = shouldLock ? new Date(Date.now() + lockoutMinutes * 60 * 1000) : null;

    return prisma.admin.update({
      where: { id },
      data: {
        failedLoginAttempts: newAttempts,
        lockedUntil
      }
    });
  }

  static async recordSuccessfulLogin(id: string) {
    return prisma.admin.update({
      where: { id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date()
      }
    });
  }

  static async delete(id: string) {
    return prisma.admin.delete({
      where: { id }
    });
  }

  static async deleteWithSuperAdminGuard(id: string) {
    return prisma.$transaction(async tx => {
      const current = await tx.admin.findUnique({ where: { id } });
      if (!current) throw new Error('ADMIN_NOT_FOUND');

      if (current.role === 'SUPER_ADMIN' && current.isActive) {
        const activeSuperCount = await tx.admin.count({
          where: { role: 'SUPER_ADMIN', isActive: true }
        });
        if (activeSuperCount <= 1) throw new Error('LAST_SUPER_ADMIN_PROTECTED');
      }

      return tx.admin.delete({ where: { id } });
    });
  }
}
