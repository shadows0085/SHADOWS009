import { Request, Response, NextFunction } from 'express';
export declare class AuthController {
    private static setRefreshTokenCookie;
    static login(req: Request, res: Response, next: NextFunction): Promise<void>;
    static refreshToken(req: Request, res: Response, next: NextFunction): Promise<void>;
    static logout(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getMe(req: Request, res: Response, next: NextFunction): Promise<void>;
    static changePassword(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getActiveSessions(req: Request, res: Response, next: NextFunction): Promise<void>;
    static revokeAllSessions(req: Request, res: Response, next: NextFunction): Promise<void>;
}
