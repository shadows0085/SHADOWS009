import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load environment variables from .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  HOST: z.string().default('127.0.0.1'),
  APP_NAME: z.string().default('SHADOW_VIDEO_VAULT'),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is strictly required'),

  // Cryptographic Secrets (Min 32 characters to ensure high entropy)
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  COOKIE_SECRET: z.string().min(32, 'COOKIE_SECRET must be at least 32 characters'),
  STREAM_SIGNING_SECRET: z.string().min(32, 'STREAM_SIGNING_SECRET must be at least 32 characters'),

  JWT_ACCESS_EXPIRATION: z.string().default('15m'),
  JWT_REFRESH_EXPIRATION_DAYS: z.coerce.number().default(7),
  STREAM_TICKET_TTL_SECONDS: z.coerce.number().default(90),

  MAX_LOGIN_ATTEMPTS: z.coerce.number().default(5),
  LOCKOUT_DURATION_MINUTES: z.coerce.number().default(15),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(120),
  UPLOAD_RATE_LIMIT_MAX_HOURLY: z.coerce.number().default(30),

  MAX_VIDEO_SIZE_BYTES: z.coerce.number().default(2147483648), // 2GB
  STORAGE_PROVIDER: z.enum(['local', 's3']).default('local'),
  LOCAL_STORAGE_PATH: z.string().default('./uploads'),

  S3_ENDPOINT: z.string().optional().default(''),
  S3_BUCKET: z.string().optional().default(''),
  S3_REGION: z.string().optional().default('us-east-1'),
  S3_ACCESS_KEY_ID: z.string().optional().default(''),
  S3_SECRET_ACCESS_KEY: z.string().optional().default(''),
  S3_FORCE_PATH_STYLE: z.coerce.boolean().optional().default(false),

  ALLOWED_ORIGINS: z.string().default('http://localhost:3000,http://localhost:5173,http://localhost:4000'),

  SUPER_ADMIN_NAME: z.string().default('Master Architect'),
  SUPER_ADMIN_EMAIL: z.string().email().default('admin@vault.local'),
  SUPER_ADMIN_PASSWORD: z.string().min(12).optional()
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ FATAL CONFIGURATION ERROR: Invalid environment variables:');
    console.error(JSON.stringify(result.error.format(), null, 2));
    process.exit(1);
  }
  return result.data;
};

export const env = parseEnv();
export type EnvConfig = typeof env;
