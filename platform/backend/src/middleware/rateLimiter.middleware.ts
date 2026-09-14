import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

/**
 * Strict rate limiter for authentication endpoints to prevent brute-force credential stuffing
 */
export const authRateLimiter = rateLimit({
  windowMs: env.LOCKOUT_DURATION_MINUTES * 60 * 1000,
  max: env.MAX_LOGIN_ATTEMPTS,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.NODE_ENV === 'test',
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
export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: env.UPLOAD_RATE_LIMIT_MAX_HOURLY,
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
export const generalApiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
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
