"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const logger_1 = require("../utils/logger");
const env_1 = require("../config/env");
const errorHandler = (err, req, res, next) => {
    if (err?.code === 'LIMIT_FILE_SIZE') {
        res.status(413).json({
            success: false,
            error: { code: 'PAYLOAD_TOO_LARGE', message: `Video exceeds the ${Math.floor(env_1.env.MAX_VIDEO_SIZE_BYTES / (1024 * 1024))} MB upload limit.` }
        });
        return;
    }
    // Always log internal details to safe, redacted server logger
    logger_1.logger.error({
        path: req.path,
        method: req.method,
        ip: req.ip,
        error: err.message,
        stack: env_1.env.NODE_ENV !== 'production' ? err.stack : undefined
    }, 'Unhandled request error');
    const statusCode = err.statusCode || 500;
    const errorCode = err.code || 'INTERNAL_SERVER_ERROR';
    // In production, sanitize internal errors completely
    const clientMessage = statusCode === 500 && env_1.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred. Please try again later.'
        : err.message || 'Internal server error';
    res.status(statusCode).json({
        success: false,
        error: {
            code: errorCode,
            message: clientMessage
        }
    });
};
exports.errorHandler = errorHandler;
