import { TokenPair } from '../security/tokens';
import { AuthenticatedAdminPayload } from '../models/types';
export declare class AuthService {
    /**
     * Secure administrator login with constant-time check, brute-force lockout, and refresh rotation
     */
    static login(email: string, passwordPlain: string, ipAddress?: string, userAgent?: string): Promise<{
        admin: AuthenticatedAdminPayload;
        tokens: TokenPair;
    }>;
    /**
     * Refresh token rotation with reuse detection
     */
    static rotateRefreshToken(rawRefreshToken: string, ipAddress?: string, userAgent?: string): Promise<{
        admin: AuthenticatedAdminPayload;
        tokens: TokenPair;
    }>;
    /**
     * Revoke token on explicit logout
     */
    static logout(rawRefreshToken: string, ipAddress?: string, userAgent?: string): Promise<void>;
    /**
     * Revoke all active sessions for administrator
     */
    static revokeAllSessions(adminId: string, ipAddress?: string, userAgent?: string): Promise<void>;
    /**
     * Change password and invalidate all existing active sessions
     */
    static changePassword(adminId: string, currentPass: string, newPass: string, ipAddress?: string, userAgent?: string): Promise<void>;
}
