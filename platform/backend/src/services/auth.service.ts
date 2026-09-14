import { AdminRepository } from '../repositories/admin.repository';
import { TokenRepository } from '../repositories/token.repository';
import { AuditRepository } from '../repositories/audit.repository';
import { CryptoUtils } from '../security/crypto';
import { TokenManager, TokenPair } from '../security/tokens';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { AdminRole, AuthenticatedAdminPayload } from '../models/types';

export class AuthService {
  /**
   * Secure administrator login with constant-time check, brute-force lockout, and refresh rotation
   */
  static async login(
    email: string,
    passwordPlain: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ admin: AuthenticatedAdminPayload; tokens: TokenPair }> {
    const admin = await AdminRepository.findByEmail(email);

    // Constant-time dummy hash verification to prevent timing attack enumeration if email doesn't exist
    const dummyHash = '$2a$12$e8Y6E73198ef0129a08e1u3b19018e1098e019238e019283e0129';

    if (!admin) {
      await CryptoUtils.verifyPassword(passwordPlain, dummyHash);
      await AuditRepository.record({
        action: 'LOGIN_FAILED_UNKNOWN_ACCOUNT',
        resourceType: 'Admin',
        ipAddress,
        userAgent,
        metadata: { attemptedEmail: email.slice(0, 3) + '***' }
      });
      throw new Error('INVALID_CREDENTIALS');
    }

    // Check account lockout
    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      const remainingMinutes = Math.ceil((admin.lockedUntil.getTime() - Date.now()) / (60 * 1000));
      await AuditRepository.record({
        adminId: admin.id,
        action: 'LOGIN_REJECTED_ACCOUNT_LOCKED',
        resourceType: 'Admin',
        resourceId: admin.id,
        ipAddress,
        userAgent,
        metadata: { remainingMinutes }
      });
      throw new Error(`ACCOUNT_TEMPORARILY_LOCKED:${remainingMinutes}`);
    }

    if (!admin.isActive) {
      await AuditRepository.record({
        adminId: admin.id,
        action: 'LOGIN_REJECTED_INACTIVE_ACCOUNT',
        resourceType: 'Admin',
        resourceId: admin.id,
        ipAddress,
        userAgent
      });
      throw new Error('ACCOUNT_DISABLED');
    }

    const isMatch = await CryptoUtils.verifyPassword(passwordPlain, admin.passwordHash);

    if (!isMatch) {
      const updatedAdmin = await AdminRepository.incrementFailedAttempts(
        admin.id,
        env.MAX_LOGIN_ATTEMPTS,
        env.LOCKOUT_DURATION_MINUTES
      );

      const isNowLocked = updatedAdmin?.lockedUntil && updatedAdmin.lockedUntil > new Date();

      await AuditRepository.record({
        adminId: admin.id,
        action: isNowLocked ? 'ACCOUNT_LOCKED_FAILED_ATTEMPTS' : 'LOGIN_FAILED_BAD_PASSWORD',
        resourceType: 'Admin',
        resourceId: admin.id,
        ipAddress,
        userAgent,
        metadata: { attempts: updatedAdmin?.failedLoginAttempts }
      });

      if (isNowLocked) {
        throw new Error(`ACCOUNT_TEMPORARILY_LOCKED:${env.LOCKOUT_DURATION_MINUTES}`);
      }
      throw new Error('INVALID_CREDENTIALS');
    }

    // Successful login: reset lockout counter
    await AdminRepository.recordSuccessfulLogin(admin.id);

    const payload: AuthenticatedAdminPayload = {
      adminId: admin.id,
      email: admin.email,
      role: admin.role as AdminRole,
      name: admin.name
    };

    const tokens = TokenManager.generateTokenPair(payload);

    // Store SHA-256 hash of refresh token in database
    const tokenHash = CryptoUtils.hashToken(tokens.refreshToken);
    const expiresAt = new Date(Date.now() + env.JWT_REFRESH_EXPIRATION_DAYS * 24 * 60 * 60 * 1000);

    await TokenRepository.create({
      adminId: admin.id,
      tokenHash,
      expiresAt,
      ipAddress,
      userAgent
    });

    await AuditRepository.record({
      adminId: admin.id,
      action: 'LOGIN_SUCCESS',
      resourceType: 'Admin',
      resourceId: admin.id,
      ipAddress,
      userAgent
    });

    return { admin: payload, tokens };
  }

  /**
   * Refresh token rotation with reuse detection
   */
  static async rotateRefreshToken(
    rawRefreshToken: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ admin: AuthenticatedAdminPayload; tokens: TokenPair }> {
    if (!rawRefreshToken) {
      throw new Error('TOKEN_REQUIRED');
    }

    const tokenHash = CryptoUtils.hashToken(rawRefreshToken);
    const storedToken = await TokenRepository.findByTokenHash(tokenHash);

    if (!storedToken) {
      throw new Error('INVALID_REFRESH_TOKEN');
    }

    // Reuse detection: If token was already revoked, an attacker or compromised client is reusing it!
    // Defense-in-depth: immediately revoke ALL sessions for this user!
    if (storedToken.revokedAt) {
      logger.warn(
        { adminId: storedToken.adminId, ipAddress },
        'SECURITY ALERT: Refresh token reuse detected! Revoking all sessions.'
      );

      await TokenRepository.revokeAllForAdmin(storedToken.adminId);
      await AuditRepository.record({
        adminId: storedToken.adminId,
        action: 'REFRESH_TOKEN_REUSE_DETECTED',
        resourceType: 'Security',
        resourceId: storedToken.id,
        ipAddress,
        userAgent,
        metadata: { revokedAllTokens: true }
      });

      throw new Error('COMPROMISED_TOKEN_REUSE_DETECTED');
    }

    // Check expiration
    if (storedToken.expiresAt < new Date()) {
      await TokenRepository.revoke(tokenHash);
      throw new Error('REFRESH_TOKEN_EXPIRED');
    }

    const admin = storedToken.admin;
    if (!admin || !admin.isActive) {
      throw new Error('ACCOUNT_DISABLED');
    }

    // Invalidate the used refresh token
    await TokenRepository.revoke(tokenHash);

    // Issue brand-new pair
    const payload: AuthenticatedAdminPayload = {
      adminId: admin.id,
      email: admin.email,
      role: admin.role as AdminRole,
      name: admin.name
    };

    const newTokens = TokenManager.generateTokenPair(payload);
    const newHash = CryptoUtils.hashToken(newTokens.refreshToken);
    const newExpiresAt = new Date(Date.now() + env.JWT_REFRESH_EXPIRATION_DAYS * 24 * 60 * 60 * 1000);

    await TokenRepository.create({
      adminId: admin.id,
      tokenHash: newHash,
      expiresAt: newExpiresAt,
      ipAddress,
      userAgent
    });

    await AuditRepository.record({
      adminId: admin.id,
      action: 'TOKEN_ROTATED',
      resourceType: 'RefreshToken',
      resourceId: storedToken.id,
      ipAddress,
      userAgent
    });

    return { admin: payload, tokens: newTokens };
  }

  /**
   * Revoke token on explicit logout
   */
  static async logout(rawRefreshToken: string, ipAddress?: string, userAgent?: string): Promise<void> {
    if (!rawRefreshToken) return;

    const tokenHash = CryptoUtils.hashToken(rawRefreshToken);
    const stored = await TokenRepository.findByTokenHash(tokenHash);

    if (stored) {
      await TokenRepository.revoke(tokenHash);
      await AuditRepository.record({
        adminId: stored.adminId,
        action: 'LOGOUT_SUCCESS',
        resourceType: 'Admin',
        resourceId: stored.adminId,
        ipAddress,
        userAgent
      });
    }
  }

  /**
   * Revoke all active sessions for administrator
   */
  static async revokeAllSessions(adminId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await TokenRepository.revokeAllForAdmin(adminId);
    await AuditRepository.record({
      adminId,
      action: 'ALL_SESSIONS_REVOKED',
      resourceType: 'Admin',
      resourceId: adminId,
      ipAddress,
      userAgent
    });
  }

  /**
   * Change password and invalidate all existing active sessions
   */
  static async changePassword(
    adminId: string,
    currentPass: string,
    newPass: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const admin = await AdminRepository.findById(adminId);
    if (!admin) throw new Error('ADMIN_NOT_FOUND');

    const matches = await CryptoUtils.verifyPassword(currentPass, admin.passwordHash);
    if (!matches) {
      await AuditRepository.record({
        adminId,
        action: 'PASSWORD_CHANGE_FAILED_WRONG_CURRENT',
        resourceType: 'Admin',
        resourceId: adminId,
        ipAddress,
        userAgent
      });
      throw new Error('INVALID_CURRENT_PASSWORD');
    }

    const newHash = await CryptoUtils.hashPassword(newPass);
    await AdminRepository.updatePassword(adminId, newHash);

    // Invalidate all tokens so any hijacked sessions are immediately disconnected
    await TokenRepository.revokeAllForAdmin(adminId);

    await AuditRepository.record({
      adminId,
      action: 'PASSWORD_CHANGED_SUCCESS',
      resourceType: 'Admin',
      resourceId: adminId,
      ipAddress,
      userAgent
    });
  }
}
