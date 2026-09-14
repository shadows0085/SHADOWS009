import { Request, Response, NextFunction } from 'express';
export declare class SocController {
    /**
     * Get SOC telemetry and active session metrics from the live server
     */
    static getTelemetry(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Trigger emergency killswitch on both live server and local process
     */
    static triggerKillswitch(req: Request, res: Response, next: NextFunction): Promise<void>;
}
