import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { TokenRepository } from '../repositories/token.repository';
import { AdminRepository } from '../repositories/admin.repository';
import { env } from '../config/env';
import { ROLE_PERMISSIONS, AdminRole } from '../models/types';

export class AuthController {
  private static setRefreshTokenCookie(res: Response, refreshToken: string) {
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/v1/auth',
      maxAge: env.JWT_REFRESH_EXPIRATION_DAYS * 24 * 60 * 60 * 1000
    });
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
      const ua = req.headers['user-agent'];

      const { admin, tokens } = await AuthService.login(email, password, ip, ua);

      AuthController.setRefreshTokenCookie(res, tokens.refreshToken);

      res.status(200).json({
        success: true,
        data: {
          admin: {
            ...admin,
            permissions: ROLE_PERMISSIONS[admin.role]
          },
          accessToken: tokens.accessToken,
          expiresInSeconds: tokens.expiresInSeconds
        }
      });
    } catch (err: any) {
      if (err.message === 'INVALID_CREDENTIALS') {
        res.status(401).json({
          success: false,
          error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' }
        });
        return;
      }

      if (err.message.startsWith('ACCOUNT_TEMPORARILY_LOCKED')) {
        const minutes = err.message.split(':')[1] || '15';
        res.status(423).json({
          success: false,
          error: {
            code: 'ACCOUNT_LOCKED',
            message: `Account is temporarily locked due to repeated failed login attempts. Retry in ${minutes} minutes.`
          }
        });
        return;
      }

      if (err.message === 'ACCOUNT_DISABLED') {
        res.status(403).json({
          success: false,
          error: { code: 'ACCOUNT_DISABLED', message: 'This administrative account has been deactivated.' }
        });
        return;
      }

      next(err);
    }
  }

  static async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rawRefreshToken = req.cookies?.refresh_token || req.body?.refreshToken;
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
      const ua = req.headers['user-agent'];

      if (!rawRefreshToken) {
        res.status(401).json({
          success: false,
          error: { code: 'REFRESH_TOKEN_REQUIRED', message: 'No refresh token provided.' }
        });
        return;
      }

      const { admin, tokens } = await AuthService.rotateRefreshToken(rawRefreshToken, ip, ua);

      AuthController.setRefreshTokenCookie(res, tokens.refreshToken);

      res.status(200).json({
        success: true,
        data: {
          admin: {
            ...admin,
            permissions: ROLE_PERMISSIONS[admin.role]
          },
          accessToken: tokens.accessToken,
          expiresInSeconds: tokens.expiresInSeconds
        }
      });
    } catch (err: any) {
      res.clearCookie('refresh_token', { path: '/api/v1/auth' });

      if (err.message === 'COMPROMISED_TOKEN_REUSE_DETECTED') {
        res.status(401).json({
          success: false,
          error: {
            code: 'SECURITY_BREACH_DETECTED',
            message: 'Suspicious session reuse detected. All sessions have been revoked for your security.'
          }
        });
        return;
      }

      res.status(401).json({
        success: false,
        error: { code: 'INVALID_REFRESH_TOKEN', message: 'Refresh token expired or invalid.' }
      });
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rawRefreshToken = req.cookies?.refresh_token || req.body?.refreshToken;
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
      const ua = req.headers['user-agent'];

      if (rawRefreshToken) {
        await AuthService.logout(rawRefreshToken, ip, ua);
      }

      res.clearCookie('refresh_token', { path: '/api/v1/auth' });
      res.clearCookie('access_token', { path: '/' });

      res.status(200).json({
        success: true,
        data: { message: 'Successfully logged out.' }
      });
    } catch (err) {
      next(err);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.admin) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not logged in.' } });
        return;
      }

      const admin = await AdminRepository.findById(req.admin.adminId);
      if (!admin || !admin.isActive) {
        res.status(403).json({ success: false, error: { code: 'ACCOUNT_INACTIVE', message: 'Account inactive.' } });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          admin: {
            id: admin.id,
            email: admin.email,
            name: admin.name,
            role: admin.role,
            permissions: ROLE_PERMISSIONS[admin.role as AdminRole] || [],
            // A new account has not logged in yet. Do not present its creation
            // time as a login event.
            lastLoginAt: admin.lastLoginAt
          }
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
      const ua = req.headers['user-agent'];

      await AuthService.changePassword(req.admin!.adminId, currentPassword, newPassword, ip, ua);
      res.clearCookie('refresh_token', { path: '/api/v1/auth' });

      res.status(200).json({
        success: true,
        data: { message: 'Password successfully changed. All active sessions invalidated.' }
      });
    } catch (err: any) {
      if (err.message === 'INVALID_CURRENT_PASSWORD') {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_CURRENT_PASSWORD', message: 'Current password does not match.' }
        });
        return;
      }
      next(err);
    }
  }

  static async getActiveSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessions = await TokenRepository.listActiveForAdmin(req.admin!.adminId);
      res.status(200).json({
        success: true,
        data: { sessions }
      });
    } catch (err) {
      next(err);
    }
  }

  static async revokeAllSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
      const ua = req.headers['user-agent'];

      await AuthService.revokeAllSessions(req.admin!.adminId, ip, ua);
      res.clearCookie('refresh_token', { path: '/api/v1/auth' });

      res.status(200).json({
        success: true,
        data: { message: 'All active sessions have been terminated.' }
      });
    } catch (err) {
      next(err);
    }
  }
}
