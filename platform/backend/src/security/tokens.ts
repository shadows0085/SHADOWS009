import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthenticatedAdminPayload } from '../models/types';
import { CryptoUtils } from './crypto';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
}

export class TokenManager {
  /**
   * Generate short-lived access token + high-entropy refresh token pair
   */
  static generateTokenPair(admin: AuthenticatedAdminPayload): TokenPair {
    const accessToken = jwt.sign(
      {
        adminId: admin.adminId,
        email: admin.email,
        role: admin.role,
        name: admin.name
      },
      env.JWT_ACCESS_SECRET,
      {
        expiresIn: '15m',
        issuer: env.APP_NAME,
        audience: 'video-admin-portal'
      }
    );

    // Opaque 64-character cryptographic refresh token
    const refreshToken = CryptoUtils.generateSecureRandomString(32);

    return {
      accessToken,
      refreshToken,
      expiresInSeconds: 15 * 60
    };
  }

  /**
   * Verify and decode JWT Access Token
   */
  static verifyAccessToken(token: string): AuthenticatedAdminPayload | null {
    try {
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET, {
        issuer: env.APP_NAME,
        audience: 'video-admin-portal'
      }) as any;

      return {
        adminId: decoded.adminId,
        email: decoded.email,
        role: decoded.role,
        name: decoded.name
      };
    } catch {
      return null;
    }
  }
}
