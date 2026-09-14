import { Request, Response, NextFunction } from 'express';
export declare class VideoController {
    static list(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getById(req: Request, res: Response, next: NextFunction): Promise<void>;
    static create(req: Request, res: Response, next: NextFunction): Promise<void>;
    static update(req: Request, res: Response, next: NextFunction): Promise<void>;
    static updateStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
    static delete(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Request signed stream ticket for private video viewing
     */
    static getStreamTicket(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Byte-Range streaming endpoint with short-lived HMAC signed ticket verification
     */
    static streamMedia(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getMetrics(req: Request, res: Response, next: NextFunction): Promise<void>;
}
