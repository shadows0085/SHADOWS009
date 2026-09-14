"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const admin_repository_1 = require("../repositories/admin.repository");
const token_repository_1 = require("../repositories/token.repository");
const audit_repository_1 = require("../repositories/audit.repository");
const crypto_1 = require("../security/crypto");
const tokens_1 = require("../security/tokens");
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
class AuthService {
    /**
     * Secure administrator login with constant-time check, brute-force lockout, and refresh rotation
     */
    static async login(email, passwordPlain, ipAddress, userAgent) {
        const admin = await admin_repository_1.AdminRepository.findByEmail(email);
        // Constant-time dummy hash verification to prevent timing attack enumeration if email doesn't exist
        const dummyHash = '$2a$12$e8Y6E73198ef0129a08e1u3b19018e1098e019238e019283e0129';
        if (!admin) {
            await crypto_1.CryptoUtils.verifyPassword(passwordPlain, dummyHash);
            await audit_repository_1.AuditRepository.record({
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
            await audit_repository_1.AuditRepository.record({
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
            await audit_repository_1.AuditRepository.record({
                adminId: admin.id,
                action: 'LOGIN_REJECTED_INACTIVE_ACCOUNT',
                resourceType: 'Admin',
                resourceId: admin.id,
                ipAddress,
                userAgent
            });
            throw new Error('ACCOUNT_DISABLED');
        }
        const isMatch = await crypto_1.CryptoUtils.verifyPassword(passwordPlain, admin.passwordHash);
        if (!isMatch) {
            const updatedAdmin = await admin_repository_1.AdminRepository.incrementFailedAttempts(admin.id, env_1.env.MAX_LOGIN_ATTEMPTS, env_1.env.LOCKOUT_DURATION_MINUTES);
            const isNowLocked = updatedAdmin?.lockedUntil && updatedAdmin.lockedUntil > new Date();
            await audit_repository_1.AuditRepository.record({
                adminId: admin.id,
                action: isNowLocked ? 'ACCOUNT_LOCKED_FAILED_ATTEMPTS' : 'LOGIN_FAILED_BAD_PASSWORD',
                resourceType: 'Admin',
                resourceId: admin.id,
                ipAddress,
                userAgent,
                metadata: { attempts: updatedAdmin?.failedLoginAttempts }
            });
            if (isNowLocked) {
                throw new Error(`ACCOUNT_TEMPORARILY_LOCKED:${env_1.env.LOCKOUT_DURATION_MINUTES}`);
            }
            throw new Error('INVALID_CREDENTIALS');
        }
        // Successful login: reset lockout counter
        await admin_repository_1.AdminRepository.recordSuccessfulLogin(admin.id);
        const payload = {
            adminId: admin.id,
            email: admin.email,
            role: admin.role,
            name: admin.name
        };
        const tokens = tokens_1.TokenManager.generateTokenPair(payload);
        // Store SHA-256 hash of refresh token in database
        const tokenHash = crypto_1.CryptoUtils.hashToken(tokens.refreshToken);
        const expiresAt = new Date(Date.now() + env_1.env.JWT_REFRESH_EXPIRATION_DAYS * 24 * 60 * 60 * 1000);
        await token_repository_1.TokenRepository.create({
            adminId: admin.id,
            tokenHash,
            expiresAt,
            ipAddress,
            userAgent
        });
        await audit_repository_1.AuditRepository.record({
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
    static async rotateRefreshToken(rawRefreshToken, ipAddress, userAgent) {
        if (!rawRefreshToken) {
            throw new Error('TOKEN_REQUIRED');
        }
        const tokenHash = crypto_1.CryptoUtils.hashToken(rawRefreshToken);
        const storedToken = await token_repository_1.TokenRepository.findByTokenHash(tokenHash);
        if (!storedToken) {
            throw new Error('INVALID_REFRESH_TOKEN');
        }
        // Reuse detection: If token was already revoked, an attacker or compromised client is reusing it!
        // Defense-in-depth: immediately revoke ALL sessions for this user!
        if (storedToken.revokedAt) {
            logger_1.logger.warn({ adminId: storedToken.adminId, ipAddress }, 'SECURITY ALERT: Refresh token reuse detected! Revoking all sessions.');
            await token_repository_1.TokenRepository.revokeAllForAdmin(storedToken.adminId);
            await audit_repository_1.AuditRepository.record({
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
            await token_repository_1.TokenRepository.revoke(tokenHash);
            throw new Error('REFRESH_TOKEN_EXPIRED');
        }
        const admin = storedToken.admin;
        if (!admin || !admin.isActive) {
            throw new Error('ACCOUNT_DISABLED');
        }
        // Invalidate the used refresh token
        await token_repository_1.TokenRepository.revoke(tokenHash);
        // Issue brand-new pair
        const payload = {
            adminId: admin.id,
            email: admin.email,
            role: admin.role,
            name: admin.name
        };
        const newTokens = tokens_1.TokenManager.generateTokenPair(payload);
        const newHash = crypto_1.CryptoUtils.hashToken(newTokens.refreshToken);
        const newExpiresAt = new Date(Date.now() + env_1.env.JWT_REFRESH_EXPIRATION_DAYS * 24 * 60 * 60 * 1000);
        await token_repository_1.TokenRepository.create({
            adminId: admin.id,
            tokenHash: newHash,
            expiresAt: newExpiresAt,
            ipAddress,
            userAgent
        });
        await audit_repository_1.AuditRepository.record({
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
    static async logout(rawRefreshToken, ipAddress, userAgent) {
        if (!rawRefreshToken)
            return;
        const tokenHash = crypto_1.CryptoUtils.hashToken(rawRefreshToken);
        const stored = await token_repository_1.TokenRepository.findByTokenHash(tokenHash);
        if (stored) {
            await token_repository_1.TokenRepository.revoke(tokenHash);
            await audit_repository_1.AuditRepository.record({
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
    static async revokeAllSessions(adminId, ipAddress, userAgent) {
        await token_repository_1.TokenRepository.revokeAllForAdmin(adminId);
        await audit_repository_1.AuditRepository.record({
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
    static async changePassword(adminId, currentPass, newPass, ipAddress, userAgent) {
        const admin = await admin_repository_1.AdminRepository.findById(adminId);
        if (!admin)
            throw new Error('ADMIN_NOT_FOUND');
        const matches = await crypto_1.CryptoUtils.verifyPassword(currentPass, admin.passwordHash);
        if (!matches) {
            await audit_repository_1.AuditRepository.record({
                adminId,
                action: 'PASSWORD_CHANGE_FAILED_WRONG_CURRENT',
                resourceType: 'Admin',
                resourceId: adminId,
                ipAddress,
                userAgent
            });
            throw new Error('INVALID_CURRENT_PASSWORD');
        }
        const newHash = await crypto_1.CryptoUtils.hashPassword(newPass);
        await admin_repository_1.AdminRepository.updatePassword(adminId, newHash);
        // Invalidate all tokens so any hijacked sessions are immediately disconnected
        await token_repository_1.TokenRepository.revokeAllForAdmin(adminId);
        await audit_repository_1.AuditRepository.record({
            adminId,
            action: 'PASSWORD_CHANGED_SUCCESS',
            resourceType: 'Admin',
            resourceId: adminId,
            ipAddress,
            userAgent
        });
    }
}
exports.AuthService = AuthService;
