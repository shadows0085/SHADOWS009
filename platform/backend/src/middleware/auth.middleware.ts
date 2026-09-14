import { Request, Response, NextFunction } from 'express';
import { TokenManager } from '../security/tokens';
import { AdminRole, AuthenticatedAdminPayload, Permission, ROLE_PERMISSIONS } from '../models/types';
import { logger } from '../utils/logger';

declare global {
  namespace Express {
    interface Request {
      admin?: AuthenticatedAdminPayload;
    }
  }
}

/**
 * Middleware: Verify Bearer JWT Access Token or HttpOnly access cookie
 */
export const authenticateAdmin = (req: Request, res: Response, next: NextFunction): void => {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.cookies && req.cookies.access_token) {
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

  const payload = TokenManager.verifyAccessToken(token);
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

/**
 * Middleware: Server-side Role-Based Access Control (RBAC)
 */
export const requireRole = (allowedRoles: AdminRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.admin) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required.' }
      });
      return;
    }

    if (!allowedRoles.includes(req.admin.role)) {
      logger.warn(
        { adminId: req.admin.adminId, role: req.admin.role, requiredRoles: allowedRoles },
        'Forbidden access attempt: Insufficient role privileges'
      );

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

/**
 * Middleware: Fine-grained Permission check
 */
export const requirePermission = (permission: Permission) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.admin) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required.' }
      });
      return;
    }

    const adminRole = req.admin.role;
    const permissions = ROLE_PERMISSIONS[adminRole] || [];

    if (!permissions.includes(permission)) {
      logger.warn(
        { adminId: req.admin.adminId, role: adminRole, requiredPermission: permission },
        'Forbidden access attempt: Lacking specific permission'
      );

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
