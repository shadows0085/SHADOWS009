import { Request, Response, NextFunction } from 'express';
import { AuditService } from '../services/audit.service';
import { AdminRepository } from '../repositories/admin.repository';
import { CryptoUtils } from '../security/crypto';

export class AuditController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, adminId, action } = req.query as any;
      const result = await AuditService.listAuditLogs({
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 25,
        adminId,
        action
      });

      res.status(200).json({
        success: true,
        data: result.logs,
        meta: result.meta
      });
    } catch (err) {
      next(err);
    }
  }
}

export class AdminController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const admins = await AdminRepository.listAll();
      res.status(200).json({
        success: true,
        data: admins
      });
    } catch (err) {
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, name, role } = req.body;

      // ═══════════════════════════════════════════════════════════════════
      // SUPER ADMIN SINGLETON ENFORCEMENT — Only ONE may exist, ever.
      // ═══════════════════════════════════════════════════════════════════
      if (role === 'SUPER_ADMIN') {
        const existingSuperCount = await AdminRepository.countActiveSuperAdmins();
        if (existingSuperCount >= 1) {
          res.status(403).json({
            success: false,
            error: {
              code: 'SUPER_ADMIN_SINGLETON_VIOLATION',
              message: 'A Super Administrator already exists. Only one Super Admin is permitted system-wide. This action has been blocked and logged.'
            }
          });
          return;
        }
      }

      const existing = await AdminRepository.findByEmail(email);
      if (existing) {
        res.status(409).json({
          success: false,
          error: { code: 'EMAIL_ALREADY_EXISTS', message: 'An account with this email already exists.' }
        });
        return;
      }

      const passwordHash = await CryptoUtils.hashPassword(password);
      const newAdmin = await AdminRepository.create({
        email,
        passwordHash,
        name,
        role
      });

      res.status(201).json({
        success: true,
        data: {
          id: newAdmin.id,
          email: newAdmin.email,
          name: newAdmin.name,
          role: newAdmin.role,
          isActive: newAdmin.isActive
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { name, email, role, isActive, password } = req.body;

      const admin = await AdminRepository.findById(id);
      if (!admin) {
        res.status(404).json({
          success: false,
          error: { code: 'ADMIN_NOT_FOUND', message: 'Administrator account not found.' }
        });
        return;
      }

      // Protect against removing/demoting the last active Super Admin
      const isTargetActiveSuperAdmin = admin.role === 'SUPER_ADMIN' && admin.isActive;
      const willDemote = role !== undefined && role !== 'SUPER_ADMIN';
      const willDeactivate = isActive !== undefined && Boolean(isActive) === false;

      if (isTargetActiveSuperAdmin && (willDemote || willDeactivate)) {
        const activeSuperCount = await AdminRepository.countActiveSuperAdmins();
        if (activeSuperCount <= 1) {
          res.status(400).json({
            success: false,
            error: {
              code: 'LAST_SUPER_ADMIN_PROTECTED',
              message: 'Cannot demote or deactivate the last active Super Administrator.'
            }
          });
          return;
        }
      }

      // Check if email already in use by another account
      if (email && email.toLowerCase().trim() !== admin.email) {
        const existing = await AdminRepository.findByEmail(email);
        if (existing && existing.id !== id) {
          res.status(409).json({
            success: false,
            error: { code: 'EMAIL_IN_USE', message: 'Email address already assigned to another administrator.' }
          });
          return;
        }
      }

      const updateData: any = {};
      if (name !== undefined) updateData.name = name.trim();
      if (email !== undefined) updateData.email = email.toLowerCase().trim();
      if (role !== undefined) updateData.role = role;
      if (isActive !== undefined) updateData.isActive = Boolean(isActive);

      if (password && password.trim().length >= 6) {
        updateData.passwordHash = await CryptoUtils.hashPassword(password.trim());
      }

      const updated = await AdminRepository.updateWithSuperAdminGuard(id, updateData);
      res.status(200).json({
        success: true,
        data: {
          id: updated.id,
          name: updated.name,
          email: updated.email,
          role: updated.role,
          isActive: updated.isActive,
          updatedAt: updated.updatedAt
        }
      });
    } catch (err: any) {
      if (err.message === 'LAST_SUPER_ADMIN_PROTECTED') {
        res.status(400).json({
          success: false,
          error: { code: 'LAST_SUPER_ADMIN_PROTECTED', message: 'Cannot demote or deactivate the last active Super Administrator.' }
        });
        return;
      }
      next(err);
    }
  }

  static async toggleStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      const target = await AdminRepository.findById(id);
      if (!target) {
        res.status(404).json({
          success: false,
          error: { code: 'ADMIN_NOT_FOUND', message: 'Administrator account not found.' }
        });
        return;
      }

      // Prevent Super Admin from disabling own account
      if (id === req.admin!.adminId && isActive === false) {
        res.status(400).json({
          success: false,
          error: { code: 'CANNOT_DEACTIVATE_SELF', message: 'You cannot deactivate your own account.' }
        });
        return;
      }

      // Prevent deactivating the last active super admin
      if (target.role === 'SUPER_ADMIN' && target.isActive && isActive === false) {
        const activeSuperCount = await AdminRepository.countActiveSuperAdmins();
        if (activeSuperCount <= 1) {
          res.status(400).json({
            success: false,
            error: {
              code: 'LAST_SUPER_ADMIN_PROTECTED',
              message: 'Cannot deactivate the last active Super Administrator.'
            }
          });
          return;
        }
      }

      const updated = await AdminRepository.updateWithSuperAdminGuard(id, { isActive: Boolean(isActive) });
      res.status(200).json({
        success: true,
        data: {
          id: updated.id,
          email: updated.email,
          isActive: updated.isActive
        }
      });
    } catch (err: any) {
      if (err.message === 'LAST_SUPER_ADMIN_PROTECTED') {
        res.status(400).json({
          success: false,
          error: { code: 'LAST_SUPER_ADMIN_PROTECTED', message: 'Cannot deactivate the last active Super Administrator.' }
        });
        return;
      }
      next(err);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (id === req.admin!.adminId) {
        res.status(400).json({
          success: false,
          error: { code: 'CANNOT_DELETE_SELF', message: 'You cannot remove your own account.' }
        });
        return;
      }

      const target = await AdminRepository.findById(id);
      if (!target) {
        res.status(404).json({
          success: false,
          error: { code: 'ADMIN_NOT_FOUND', message: 'Administrator account not found.' }
        });
        return;
      }

      if (target.role === 'SUPER_ADMIN') {
        const activeSuperCount = await AdminRepository.countActiveSuperAdmins();
        if (activeSuperCount <= 1) {
          res.status(400).json({
            success: false,
            error: {
              code: 'LAST_SUPER_ADMIN_PROTECTED',
              message: 'Cannot delete the last Super Administrator.'
            }
          });
          return;
        }
      }

      await AdminRepository.deleteWithSuperAdminGuard(id);
      res.status(200).json({
        success: true,
        message: 'Administrator account deleted successfully.'
      });
    } catch (err: any) {
      if (err.message === 'LAST_SUPER_ADMIN_PROTECTED') {
        res.status(400).json({
          success: false,
          error: { code: 'LAST_SUPER_ADMIN_PROTECTED', message: 'Cannot delete the last active Super Administrator.' }
        });
        return;
      }
      next(err);
    }
  }

  static async getActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const admin = await AdminRepository.findById(id);
      if (!admin) {
        res.status(404).json({
          success: false,
          error: { code: 'ADMIN_NOT_FOUND', message: 'Administrator account not found.' }
        });
        return;
      }

      const { prisma } = require('../repositories/prisma.client');
      const logs = await prisma.auditLog.findMany({
        where: { adminId: id },
        orderBy: { createdAt: 'desc' },
        take: 30
      });

      const totalLogins = await prisma.auditLog.count({
        where: { adminId: id, action: 'LOGIN_SUCCESS' }
      });

      // Presence heuristic: active if last login or action was within 2 hours
      const now = Date.now();
      const lastActionTime = logs.length > 0 ? new Date(logs[0].createdAt).getTime() : 0;
      const lastLoginTime = admin.lastLoginAt ? new Date(admin.lastLoginAt).getTime() : 0;
      const latestTime = Math.max(lastActionTime, lastLoginTime);

      const presence = (now - latestTime < 30 * 60 * 1000) ? 'ONLINE' :
                       (now - latestTime < 4 * 60 * 60 * 1000) ? 'IDLE' : 'OFFLINE';

      res.status(200).json({
        success: true,
        data: {
          admin: {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
            isActive: admin.isActive,
            createdAt: admin.createdAt,
            lastLoginAt: admin.lastLoginAt
          },
          attendance: {
            presence,
            totalLogins,
            lastActive: latestTime ? new Date(latestTime).toISOString() : null,
            recentLogs: logs
          }
        }
      });
    } catch (err) {
      next(err);
    }
  }
}
