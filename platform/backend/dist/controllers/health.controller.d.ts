import { Request, Response } from 'express';
export declare class HealthController {
    static liveness(req: Request, res: Response): Promise<void>;
    static readiness(req: Request, res: Response): Promise<void>;
}
