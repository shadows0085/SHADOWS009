"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const zod_1 = require("zod");
// Load environment variables from .env
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'test', 'production']).default('development'),
    PORT: zod_1.z.coerce.number().default(4000),
    HOST: zod_1.z.string().default('127.0.0.1'),
    APP_NAME: zod_1.z.string().default('SHADOW_VIDEO_VAULT'),
    DATABASE_URL: zod_1.z.string().min(1, 'DATABASE_URL is strictly required'),
    // Cryptographic Secrets (Min 32 characters to ensure high entropy)
    JWT_ACCESS_SECRET: zod_1.z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
    JWT_REFRESH_SECRET: zod_1.z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
    COOKIE_SECRET: zod_1.z.string().min(32, 'COOKIE_SECRET must be at least 32 characters'),
    STREAM_SIGNING_SECRET: zod_1.z.string().min(32, 'STREAM_SIGNING_SECRET must be at least 32 characters'),
    JWT_ACCESS_EXPIRATION: zod_1.z.string().default('15m'),
    JWT_REFRESH_EXPIRATION_DAYS: zod_1.z.coerce.number().default(7),
    STREAM_TICKET_TTL_SECONDS: zod_1.z.coerce.number().default(90),
    MAX_LOGIN_ATTEMPTS: zod_1.z.coerce.number().default(5),
    LOCKOUT_DURATION_MINUTES: zod_1.z.coerce.number().default(15),
    RATE_LIMIT_WINDOW_MS: zod_1.z.coerce.number().default(60000),
    RATE_LIMIT_MAX_REQUESTS: zod_1.z.coerce.number().default(120),
    UPLOAD_RATE_LIMIT_MAX_HOURLY: zod_1.z.coerce.number().default(30),
    MAX_VIDEO_SIZE_BYTES: zod_1.z.coerce.number().default(2147483648), // 2GB
    STORAGE_PROVIDER: zod_1.z.enum(['local', 's3']).default('local'),
    LOCAL_STORAGE_PATH: zod_1.z.string().default('./uploads'),
    S3_ENDPOINT: zod_1.z.string().optional().default(''),
    S3_BUCKET: zod_1.z.string().optional().default(''),
    S3_REGION: zod_1.z.string().optional().default('us-east-1'),
    S3_ACCESS_KEY_ID: zod_1.z.string().optional().default(''),
    S3_SECRET_ACCESS_KEY: zod_1.z.string().optional().default(''),
    S3_FORCE_PATH_STYLE: zod_1.z.coerce.boolean().optional().default(false),
    ALLOWED_ORIGINS: zod_1.z.string().default('http://localhost:3000,http://localhost:5173,http://localhost:4000'),
    SUPER_ADMIN_NAME: zod_1.z.string().default('Master Architect'),
    SUPER_ADMIN_EMAIL: zod_1.z.string().email().default('admin@vault.local'),
    SUPER_ADMIN_PASSWORD: zod_1.z.string().optional()
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
exports.env = parseEnv();
