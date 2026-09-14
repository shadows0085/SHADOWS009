"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const env_1 = require("./config/env");
const logger_1 = require("./utils/logger");
const rateLimiter_middleware_1 = require("./middleware/rateLimiter.middleware");
const errorHandler_middleware_1 = require("./middleware/errorHandler.middleware");
const routes_1 = __importDefault(require("./routes"));
const createApp = () => {
    const app = (0, express_1.default)();
    // 1. Trust proxy for rate-limiting behind local reverse proxies only
    app.set('trust proxy', 'loopback');
    // 2. Helmet Security Headers with strict Content-Security-Policy
    app.use((0, helmet_1.default)({
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
    }));
    // 3. Strict CORS - Never allow wildcard (*) in authenticated admin platform
    const allowedOrigins = env_1.env.ALLOWED_ORIGINS.split(',').map(o => o.trim());
    app.use((0, cors_1.default)({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            }
            else {
                logger_1.logger.warn({ rejectedOrigin: origin }, 'CORS request blocked from untrusted origin');
                callback(new Error('CORS_ORIGIN_NOT_ALLOWED'));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Range', 'X-Requested-With']
    }));
    // 4. Cookie parser with cryptographic secret
    app.use((0, cookie_parser_1.default)(env_1.env.COOKIE_SECRET));
    // 5. Payload size limits
    app.use(express_1.default.json({ limit: '2mb' }));
    app.use(express_1.default.urlencoded({ extended: true, limit: '2mb' }));
    // 6. Global API rate limiting
    app.use('/api', rateLimiter_middleware_1.generalApiLimiter);
    // 7. Mount API v1 Routes
    app.use('/api/v1', routes_1.default);
    // 8. Root status
    app.get('/', (req, res) => {
        res.status(200).json({
            name: env_1.env.APP_NAME,
            environment: env_1.env.NODE_ENV,
            version: '1.0.0',
            apiDoc: '/api/v1/health'
        });
    });
    // 9. 404 Route Catch-All
    app.use((req, res) => {
        res.status(404).json({
            success: false,
            error: {
                code: 'ROUTE_NOT_FOUND',
                message: `Endpoint ${req.method} ${req.path} does not exist.`
            }
        });
    });
    // 10. Centralized Error Sanitizer
    app.use(errorHandler_middleware_1.errorHandler);
    return app;
};
exports.createApp = createApp;
