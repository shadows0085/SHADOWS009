import { Request, Response, NextFunction } from 'express';
export declare class UploadController {
    /**
     * Direct file upload with in-memory buffer inspection before writing to disk
     */
    static uploadSingle(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Resumable chunked upload: Initiate
     */
    static initiateChunked(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
      * Resumable chunked upload: Append chunk
     */
    static appendChunk(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Resumable chunked upload: Finalize and assemble
     */
    static finalizeChunked(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Resumable chunked upload: Query status
     */
    static getStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Resumable chunked upload: Cancel and remove chunks
     */
    static cancel(req: Request, res: Response, next: NextFunction): Promise<void>;
}
