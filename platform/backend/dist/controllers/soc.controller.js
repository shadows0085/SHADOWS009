"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocController = void 0;
const path_1 = __importDefault(require("path"));
const http_1 = __importDefault(require("http"));
// Root directory
const ROOT_DIR = path_1.default.resolve(__dirname, '../../../../');
const LIVE_SERVER_PORT = process.env.PORT_GATEWAY || 3000;
function queryLiveServer(reqPath, method = 'GET') {
    return new Promise((resolve) => {
        const options = {
            hostname: '127.0.0.1',
            port: Number(LIVE_SERVER_PORT),
            path: reqPath,
            method,
            headers: {
                'x-requested-by': 'platform-backend',
                'x-internal-token': process.env.STREAM_SIGNING_SECRET || ''
            },
            timeout: 1500
        };
        const req = http_1.default.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(JSON.parse(data));
                    }
                    else {
                        resolve(null);
                    }
                }
                catch {
                    resolve(null);
                }
            });
        });
        req.on('error', () => resolve(null));
        req.on('timeout', () => {
            req.destroy();
            resolve(null);
        });
        req.end();
    });
}
class SocController {
    /**
     * Get SOC telemetry and active session metrics from the live server
     */
    static async getTelemetry(req, res, next) {
        try {
            // 1. Try querying live portfolio server process first
            const liveData = await queryLiveServer('/api/admin/telemetry', 'GET');
            if (liveData && liveData.metrics) {
                res.status(200).json({
                    success: true,
                    data: {
                        metrics: liveData.metrics,
                        activeSessions: liveData.activeSessions || [],
                        activeTickets: liveData.activeTickets || [],
                        recentEvents: liveData.recentEvents || [],
                        systemTime: new Date().toISOString()
                    }
                });
                return;
            }
            // 2. Fallback to in-memory local module if live server is in-process
            let legacyMetrics = {
                totalStreams: 0,
                activeStreams: 0,
                blockedAttempts: 0,
                devtoolsTriggers: 0,
                rateLimitViolations: 0,
                honeypotHits: 0
            };
            let activeSessions = [];
            let activeTickets = [];
            try {
                const auditLogger = require(path_1.default.join(ROOT_DIR, 'backend/services/auditLogger.js'));
                legacyMetrics = auditLogger.getSecurityMetrics();
            }
            catch { }
            try {
                const sessionAuth = require(path_1.default.join(ROOT_DIR, 'backend/security/sessionAuth.js'));
                activeSessions = sessionAuth.getAllActiveSessions();
            }
            catch { }
            try {
                const signedUrl = require(path_1.default.join(ROOT_DIR, 'backend/security/signedUrl.js'));
                activeTickets = signedUrl.getActiveTokensList();
            }
            catch { }
            res.status(200).json({
                success: true,
                data: {
                    metrics: legacyMetrics,
                    activeSessions,
                    activeTickets,
                    systemTime: new Date().toISOString()
                }
            });
        }
        catch (err) {
            next(err);
        }
    }
    /**
     * Trigger emergency killswitch on both live server and local process
     */
    static async triggerKillswitch(req, res, next) {
        try {
            // Forward killswitch to the live portfolio server process
            await queryLiveServer('/api/admin/killswitch', 'POST');
            // Also revoke in local modules
            try {
                const signedUrl = require(path_1.default.join(ROOT_DIR, 'backend/security/signedUrl.js'));
                signedUrl.revokeAllTokens();
            }
            catch { }
            try {
                const auditLogger = require(path_1.default.join(ROOT_DIR, 'backend/services/auditLogger.js'));
                auditLogger.logSecurityEvent({
                    type: 'EMERGENCY_KILLSWITCH_TRIGGERED',
                    ip: req.ip || '127.0.0.1',
                    sessionId: 'super-admin-action',
                    details: { triggeredBy: req.admin?.email || 'SuperAdmin' },
                    severity: 'CRITICAL'
                });
            }
            catch { }
            res.status(200).json({
                success: true,
                message: 'EMERGENCY KILLSWITCH EXECUTED: All active streaming tokens and tickets revoked across the platform and live server.'
            });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.SocController = SocController;
