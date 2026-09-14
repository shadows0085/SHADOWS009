/**
 * Strict rate limiter for authentication endpoints to prevent brute-force credential stuffing
 */
export declare const authRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Upload operation rate limiter to prevent disk exhaustion denial-of-service
 */
export declare const uploadRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Standard API rate limiter
 */
export declare const generalApiLimiter: import("express-rate-limit").RateLimitRequestHandler;
