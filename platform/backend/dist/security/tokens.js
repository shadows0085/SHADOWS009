"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenManager = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const crypto_1 = require("./crypto");
class TokenManager {
    /**
     * Generate short-lived access token + high-entropy refresh token pair
     */
    static generateTokenPair(admin) {
        const accessToken = jsonwebtoken_1.default.sign({
            adminId: admin.adminId,
            email: admin.email,
            role: admin.role,
            name: admin.name
        }, env_1.env.JWT_ACCESS_SECRET, {
            expiresIn: '15m',
            issuer: env_1.env.APP_NAME,
            audience: 'video-admin-portal'
        });
        // Opaque 64-character cryptographic refresh token
        const refreshToken = crypto_1.CryptoUtils.generateSecureRandomString(32);
        return {
            accessToken,
            refreshToken,
            expiresInSeconds: 15 * 60
        };
    }
    /**
     * Verify and decode JWT Access Token
     */
    static verifyAccessToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_ACCESS_SECRET, {
                issuer: env_1.env.APP_NAME,
                audience: 'video-admin-portal'
            });
            return {
                adminId: decoded.adminId,
                email: decoded.email,
                role: decoded.role,
                name: decoded.name
            };
        }
        catch {
            return null;
        }
    }
}
exports.TokenManager = TokenManager;
