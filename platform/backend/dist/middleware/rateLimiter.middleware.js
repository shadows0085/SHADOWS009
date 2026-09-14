"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalApiLimiter = exports.uploadRateLimiter = exports.authRateLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_1 = require("../config/env");
/**
 * Strict rate limiter for authentication endpoints to prevent brute-force credential stuffing
 */
exports.authRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: env_1.env.LOCKOUT_DURATION_MINUTES * 60 * 1000,
    max: env_1.env.MAX_LOGIN_ATTEMPTS,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => env_1.env.NODE_ENV === 'test',
    message: {
        success: false,
        error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many login attempts. Please try again after 15 minutes.'
        }
    }
});
/**
 * Upload operation rate limiter to prevent disk exhaustion denial-of-service
 */
exports.uploadRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: env_1.env.UPLOAD_RATE_LIMIT_MAX_HOURLY,
    standardHeaders: true,
    legacyHeaders: false,
    // A large upload is one authenticated operation, even though it may carry
    // hundreds of bounded parts. The session itself enforces ownership, order,
    // and declared-size limits; count its initiation/finalization instead.
    skip: (req) => req.method === 'PUT' && /^\/chunked\/[0-9a-f-]{36}$/i.test(req.path),
    message: {
        success: false,
        error: {
            code: 'UPLOAD_RATE_LIMIT_EXCEEDED',
            message: 'Upload limit reached for this hour. Please try again later.'
        }
    }
});
/**
 * Standard API rate limiter
 */
exports.generalApiLimiter = (0, express_rate_limit_1.default)({
    windowMs: env_1.env.RATE_LIMIT_WINDOW_MS,
    max: env_1.env.RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.method === 'PUT' && /^\/api\/v1\/uploads\/chunked\/[0-9a-f-]{36}$/i.test(req.path),
    message: {
        success: false,
        error: {
            code: 'API_RATE_LIMIT_EXCEEDED',
            message: 'Too many requests. Please slow down.'
        }
    }
});
