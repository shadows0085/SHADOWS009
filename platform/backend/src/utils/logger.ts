import pino from 'pino';
import { env } from '../config/env';

export const logger = pino({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  redact: {
    paths: [
      'password',
      'passwordHash',
      'token',
      'accessToken',
      'refreshToken',
      'cookie',
      'headers.authorization',
      'headers.cookie',
      'JWT_ACCESS_SECRET',
      'JWT_REFRESH_SECRET',
      'S3_SECRET_ACCESS_KEY'
    ],
    censor: '[REDACTED_SENSITIVE]'
  },
  transport:
    env.NODE_ENV !== 'production'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname'
          }
        }
      : undefined
});
