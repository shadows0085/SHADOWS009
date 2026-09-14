import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { env } from '../config/env';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err?.code === 'LIMIT_FILE_SIZE') {
    res.status(413).json({
      success: false,
      error: { code: 'PAYLOAD_TOO_LARGE', message: `Video exceeds the ${Math.floor(env.MAX_VIDEO_SIZE_BYTES / (1024 * 1024))} MB upload limit.` }
    });
    return;
  }

  // Always log internal details to safe, redacted server logger
  logger.error(
    {
      path: req.path,
      method: req.method,
      ip: req.ip,
      error: err.message,
      stack: env.NODE_ENV !== 'production' ? err.stack : undefined
    },
    'Unhandled request error'
  );

  const statusCode = err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_SERVER_ERROR';

  // In production, sanitize internal errors completely
  const clientMessage =
    statusCode === 500 && env.NODE_ENV === 'production'
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
