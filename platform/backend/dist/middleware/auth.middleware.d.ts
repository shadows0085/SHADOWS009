import { Request, Response, NextFunction } from 'express';
import { AdminRole, AuthenticatedAdminPayload, Permission } from '../models/types';
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
export declare const authenticateAdmin: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware: Server-side Role-Based Access Control (RBAC)
 */
export declare const requireRole: (allowedRoles: AdminRole[]) => (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware: Fine-grained Permission check
 */
export declare const requirePermission: (permission: Permission) => (req: Request, res: Response, next: NextFunction) => void;
