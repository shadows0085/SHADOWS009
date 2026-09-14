export declare class CryptoUtils {
    private static readonly BCRYPT_ROUNDS;
    /**
     * Securely hash a plaintext password with salt rounds
     */
    static hashPassword(password: string): Promise<string>;
    /**
     * Verify password against stored hash using constant-time check
     */
    static verifyPassword(password: string, hash: string): Promise<boolean>;
    /**
     * Hash a refresh token before storing in database (Defense against DB read breaches)
     */
    static hashToken(token: string): string;
    /**
     * Generate high-entropy cryptographic token
     */
    static generateSecureRandomString(bytes?: number): string;
    /**
     * Generate HMAC-SHA256 signed ticket for short-lived private video streams
     */
    static signStreamTicket(payload: Record<string, any>): string;
    /**
     * Verify and parse HMAC-SHA256 stream ticket with constant-time check
     */
    static verifyStreamTicket<T = any>(token: string): {
        valid: boolean;
        payload?: T;
        error?: string;
    };
    /**
     * Constant-time string comparison helper
     */
    static safeStringCompare(a: string, b: string): boolean;
}
