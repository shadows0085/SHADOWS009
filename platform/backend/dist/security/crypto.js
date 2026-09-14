"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CryptoUtils = void 0;
const crypto_1 = __importDefault(require("crypto"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const env_1 = require("../config/env");
class CryptoUtils {
    static BCRYPT_ROUNDS = 12;
    /**
     * Securely hash a plaintext password with salt rounds
     */
    static async hashPassword(password) {
        return bcryptjs_1.default.hash(password, this.BCRYPT_ROUNDS);
    }
    /**
     * Verify password against stored hash using constant-time check
     */
    static async verifyPassword(password, hash) {
        return bcryptjs_1.default.compare(password, hash);
    }
    /**
     * Hash a refresh token before storing in database (Defense against DB read breaches)
     */
    static hashToken(token) {
        return crypto_1.default.createHash('sha256').update(token).digest('hex');
    }
    /**
     * Generate high-entropy cryptographic token
     */
    static generateSecureRandomString(bytes = 32) {
        return crypto_1.default.randomBytes(bytes).toString('hex');
    }
    /**
     * Generate HMAC-SHA256 signed ticket for short-lived private video streams
     */
    static signStreamTicket(payload) {
        const serialized = Buffer.from(JSON.stringify(payload)).toString('base64url');
        const signature = crypto_1.default
            .createHmac('sha256', env_1.env.STREAM_SIGNING_SECRET)
            .update(serialized)
            .digest('base64url');
        return `${serialized}.${signature}`;
    }
    /**
     * Verify and parse HMAC-SHA256 stream ticket with constant-time check
     */
    static verifyStreamTicket(token) {
        if (!token || !token.includes('.')) {
            return { valid: false, error: 'INVALID_FORMAT' };
        }
        const [serialized, signature] = token.split('.');
        if (!serialized || !signature) {
            return { valid: false, error: 'MALFORMED_TOKEN' };
        }
        const expectedSignature = crypto_1.default
            .createHmac('sha256', env_1.env.STREAM_SIGNING_SECRET)
            .update(serialized)
            .digest('base64url');
        const sigBuf = Buffer.from(signature);
        const expBuf = Buffer.from(expectedSignature);
        if (sigBuf.length !== expBuf.length || !crypto_1.default.timingSafeEqual(sigBuf, expBuf)) {
            return { valid: false, error: 'SIGNATURE_MISMATCH' };
        }
        try {
            const payload = JSON.parse(Buffer.from(serialized, 'base64url').toString('utf8'));
            return { valid: true, payload };
        }
        catch {
            return { valid: false, error: 'INVALID_JSON_PAYLOAD' };
        }
    }
    /**
     * Constant-time string comparison helper
     */
    static safeStringCompare(a, b) {
        const bufA = Buffer.from(a);
        const bufB = Buffer.from(b);
        if (bufA.length !== bufB.length)
            return false;
        return crypto_1.default.timingSafeEqual(bufA, bufB);
    }
}
exports.CryptoUtils = CryptoUtils;
