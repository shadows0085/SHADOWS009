import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { logger } from './utils/logger';
import { generalApiLimiter } from './middleware/rateLimiter.middleware';
import { errorHandler } from './middleware/errorHandler.middleware';
import apiV1Router from './routes';

export const createApp = (): Application => {
  const app = express();

  // 1. Trust proxy for rate-limiting behind local reverse proxies only
  app.set('trust proxy', 'loopback');

  // 2. Helmet Security Headers with strict Content-Security-Policy
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'blob:'],
          mediaSrc: ["'self'", 'blob:'],
          connectSrc: ["'self'"],
          frameAncestors: ["'none'"],
          objectSrc: ["'none'"]
        }
      },
      crossOriginEmbedderPolicy: false,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
    })
  );

  // 3. Strict CORS - Never allow wildcard (*) in authenticated admin platform
  const allowedOrigins = env.ALLOWED_ORIGINS.split(',').map(o => o.trim());
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          logger.warn({ rejectedOrigin: origin }, 'CORS request blocked from untrusted origin');
          callback(new Error('CORS_ORIGIN_NOT_ALLOWED'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Range', 'X-Requested-With']
    })
  );

  // 4. Cookie parser with cryptographic secret
  app.use(cookieParser(env.COOKIE_SECRET));

  // 5. Payload size limits
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));

  // 6. Global API rate limiting
  app.use('/api', generalApiLimiter);

  // 7. Mount API v1 Routes
  app.use('/api/v1', apiV1Router);

  // 8. Root status
  app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
      name: env.APP_NAME,
      environment: env.NODE_ENV,
      version: '1.0.0',
      apiDoc: '/api/v1/health'
    });
  });

  // 9. 404 Route Catch-All
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'ROUTE_NOT_FOUND',
        message: `Endpoint ${req.method} ${req.path} does not exist.`
      }
    });
  });

  // 10. Centralized Error Sanitizer
  app.use(errorHandler);

  return app;
};
