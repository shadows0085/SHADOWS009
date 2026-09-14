import { Request, Response, NextFunction } from 'express';
export declare class AuditController {
    static list(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare class AdminController {
    static list(req: Request, res: Response, next: NextFunction): Promise<void>;
    static create(req: Request, res: Response, next: NextFunction): Promise<void>;
    static update(req: Request, res: Response, next: NextFunction): Promise<void>;
    static toggleStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
    static delete(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getActivity(req: Request, res: Response, next: NextFunction): Promise<void>;
}
