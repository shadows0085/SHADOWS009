import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { env } from '../config/env';

export class CryptoUtils {
  private static readonly BCRYPT_ROUNDS = 12;

  /**
   * Securely hash a plaintext password with salt rounds
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.BCRYPT_ROUNDS);
  }

  /**
   * Verify password against stored hash using constant-time check
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Hash a refresh token before storing in database (Defense against DB read breaches)
   */
  static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Generate high-entropy cryptographic token
   */
  static generateSecureRandomString(bytes: number = 32): string {
    return crypto.randomBytes(bytes).toString('hex');
  }

  /**
   * Generate HMAC-SHA256 signed ticket for short-lived private video streams
   */
  static signStreamTicket(payload: Record<string, any>): string {
    const serialized = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto
      .createHmac('sha256', env.STREAM_SIGNING_SECRET)
      .update(serialized)
      .digest('base64url');

    return `${serialized}.${signature}`;
  }

  /**
   * Verify and parse HMAC-SHA256 stream ticket with constant-time check
   */
  static verifyStreamTicket<T = any>(token: string): { valid: boolean; payload?: T; error?: string } {
    if (!token || !token.includes('.')) {
      return { valid: false, error: 'INVALID_FORMAT' };
    }

    const [serialized, signature] = token.split('.');
    if (!serialized || !signature) {
      return { valid: false, error: 'MALFORMED_TOKEN' };
    }

    const expectedSignature = crypto
      .createHmac('sha256', env.STREAM_SIGNING_SECRET)
      .update(serialized)
      .digest('base64url');

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSignature);

    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return { valid: false, error: 'SIGNATURE_MISMATCH' };
    }

    try {
      const payload = JSON.parse(Buffer.from(serialized, 'base64url').toString('utf8')) as T;
      return { valid: true, payload };
    } catch {
      return { valid: false, error: 'INVALID_JSON_PAYLOAD' };
    }
  }

  /**
   * Constant-time string comparison helper
   */
  static safeStringCompare(a: string, b: string): boolean {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  }
}
