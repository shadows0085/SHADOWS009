import { AuthenticatedAdminPayload } from '../models/types';
export interface TokenPair {
    accessToken: string;
    refreshToken: string;
    expiresInSeconds: number;
}
export declare class TokenManager {
    /**
     * Generate short-lived access token + high-entropy refresh token pair
     */
    static generateTokenPair(admin: AuthenticatedAdminPayload): TokenPair;
    /**
     * Verify and decode JWT Access Token
     */
    static verifyAccessToken(token: string): AuthenticatedAdminPayload | null;
}
