import { Request, Response, NextFunction } from 'express';
export interface NotificationItem {
    id: string;
    enabled: boolean;
    title: string;
    message: string;
    badge: string;
    type: 'gold' | 'alert' | 'info' | 'success';
    actionText?: string;
    actionLink?: string;
    updatedAt?: string;
}
export interface NotificationsData {
    activeId: string | null;
    globalEnabled: boolean;
    items: NotificationItem[];
}
export interface ShowcaseProject {
    title: string;
    plainTitle?: string;
    assetId?: string;
    file: string;
    category?: string;
    badge?: string;
    description: string;
    productionTime?: string;
    locations?: string;
    resolution?: string;
    duration?: string;
    progress?: string;
}
export declare class PortfolioController {
    /**
     * Get all portfolio projects and hero settings
     */
    static getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Add a new project
     */
    static addProject(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Update an existing project
     */
    static updateProject(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Delete a project
     */
    static deleteProject(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Update Hero section video configuration
     */
    static updateHero(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Update Featured Showcase section video configuration
     */
    static updateShowcase(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Direct video file upload for portfolio replacement
     */
    static uploadVideoAsset(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * List all available video files in uploaded-video directory
     */
    static getAvailableVideos(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get all notifications & global toggle status
     */
    static getNotifications(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Update notifications configuration & active status
     */
    static updateNotifications(req: Request, res: Response, next: NextFunction): Promise<void>;
}
