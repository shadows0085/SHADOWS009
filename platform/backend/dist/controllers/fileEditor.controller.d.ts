import { Request, Response, NextFunction } from 'express';
export declare class FileEditorController {
    /**
     * Get file tree of the project
     */
    static getFileTree(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Read file content
     */
    static readFile(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Save / overwrite file content with atomic backup
     */
    static writeFile(req: Request, res: Response, next: NextFunction): Promise<void>;
}
