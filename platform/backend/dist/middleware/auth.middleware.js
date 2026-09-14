"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePermission = exports.requireRole = exports.authenticateAdmin = void 0;
const tokens_1 = require("../security/tokens");
const types_1 = require("../models/types");
const logger_1 = require("../utils/logger");
/**
 * Middleware: Verify Bearer JWT Access Token or HttpOnly access cookie
 */
const authenticateAdmin = (req, res, next) => {
    let token;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7).trim();
    }
    else if (req.cookies && req.cookies.access_token) {
        token = req.cookies.access_token;
    }
    if (!token) {
        res.status(401).json({
            success: false,
            error: {
                code: 'UNAUTHORIZED',
                message: 'Authentication required. No valid access token provided.'
            }
        });
        return;
    }
    const payload = tokens_1.TokenManager.verifyAccessToken(token);
    if (!payload) {
        res.status(401).json({
            success: false,
            error: {
                code: 'TOKEN_INVALID_OR_EXPIRED',
                message: 'Access token is invalid or has expired.'
            }
        });
        return;
    }
    req.admin = payload;
    next();
};
exports.authenticateAdmin = authenticateAdmin;
/**
 * Middleware: Server-side Role-Based Access Control (RBAC)
 */
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.admin) {
            res.status(401).json({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'Authentication required.' }
            });
            return;
        }
        if (!allowedRoles.includes(req.admin.role)) {
            logger_1.logger.warn({ adminId: req.admin.adminId, role: req.admin.role, requiredRoles: allowedRoles }, 'Forbidden access attempt: Insufficient role privileges');
            res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: `Access denied. Requires one of: [${allowedRoles.join(', ')}].`
                }
            });
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
/**
 * Middleware: Fine-grained Permission check
 */
const requirePermission = (permission) => {
    return (req, res, next) => {
        if (!req.admin) {
            res.status(401).json({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'Authentication required.' }
            });
            return;
        }
        const adminRole = req.admin.role;
        const permissions = types_1.ROLE_PERMISSIONS[adminRole] || [];
        if (!permissions.includes(permission)) {
            logger_1.logger.warn({ adminId: req.admin.adminId, role: adminRole, requiredPermission: permission }, 'Forbidden access attempt: Lacking specific permission');
            res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN_PERMISSION',
                    message: `Access denied. Missing permission '${permission}'.`
                }
            });
            return;
        }
        next();
    };
};
exports.requirePermission = requirePermission;
