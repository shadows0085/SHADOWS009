import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { UploadService } from '../services/upload.service';

// Path to root data/videos.json
const ROOT_DIR = path.resolve(__dirname, '../../../../');
const VIDEOS_JSON_PATH = path.join(ROOT_DIR, 'data', 'videos.json');

interface PortfolioProject {
  id: string;
  assetId?: string;
  file: string;
  title: string;
  category: string;
  cat_label: string;
  meta: string;
  size?: string;
  thumb_color?: string;
  thumb_glow?: Array<{
    w: number;
    h: number;
    color: string;
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
    delay?: string;
  }>;
}

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

interface VideosData {
  version?: number;
  hero: {
    src: string;
    assetId: string;
    type: string;
    label: string;
    badge: string;
  };
  showcase?: ShowcaseProject;
  portfolio: PortfolioProject[];
  notifications?: NotificationsData;
}

const DEFAULT_NOTIFICATIONS: NotificationsData = {
  activeId: 'notif-1',
  globalEnabled: true,
  items: [
    {
      id: 'notif-1',
      enabled: true,
      title: 'Open for Bookings',
      message: 'Now accepting commercial video editing & motion design projects for 2025/2026.',
      badge: 'AVAILABLE',
      type: 'gold',
      actionText: 'Get in Touch',
      actionLink: '#contact'
    },
    {
      id: 'notif-2',
      enabled: false,
      title: 'Studio Notice / Production Mode',
      message: 'Currently on-site shooting production. Inquiries will be answered within 24 hours.',
      badge: 'ON SET',
      type: 'alert',
      actionText: 'Contact',
      actionLink: '#contact'
    },
    {
      id: 'notif-3',
      enabled: false,
      title: 'Featured Reel Update',
      message: 'New 4K HDR Urban Mirage project added to the interactive portfolio showcase.',
      badge: 'NEW SHOWREEL',
      type: 'info',
      actionText: 'Watch Video',
      actionLink: '#portfolio'
    }
  ]
};

// Mutex queue to serialize writes to videos.json
let writeQueue = Promise.resolve();

function readVideosJson(): VideosData {
  if (!fs.existsSync(VIDEOS_JSON_PATH)) {
    throw new Error('videos.json not found at ' + VIDEOS_JSON_PATH);
  }
  const content = fs.readFileSync(VIDEOS_JSON_PATH, 'utf-8');
  const data = JSON.parse(content) as VideosData;
  if (!data.notifications || !Array.isArray(data.notifications.items) || data.notifications.items.length === 0) {
    data.notifications = DEFAULT_NOTIFICATIONS;
  }
  if (typeof data.version !== 'number') {
    data.version = 1;
  }
  return data;
}

async function writeVideosJson(data: VideosData, expectedVersion?: number): Promise<VideosData> {
  const operation = writeQueue.then(() => {
    if (!fs.existsSync(VIDEOS_JSON_PATH)) {
      throw new Error('videos.json not found at ' + VIDEOS_JSON_PATH);
    }
    const currentContent = fs.readFileSync(VIDEOS_JSON_PATH, 'utf-8');
    const current = JSON.parse(currentContent) as VideosData;
    const currentVersion = current.version || 1;

    if (expectedVersion === undefined || currentVersion !== expectedVersion) {
      const err: any = new Error('CONCURRENT_MODIFICATION');
      err.statusCode = 409;
      err.code = 'CONCURRENT_MODIFICATION';
      err.currentVersion = currentVersion;
      throw err;
    }

    data.version = currentVersion + 1;
    fs.copyFileSync(VIDEOS_JSON_PATH, `${VIDEOS_JSON_PATH}.bak`);

    const tmpPath = `${VIDEOS_JSON_PATH}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`;
    fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tmpPath, VIDEOS_JSON_PATH);
    return data;
  });

  // Keep the queue usable after a rejected stale write.
  writeQueue = operation.then(
    () => undefined,
    () => undefined
  );
  return operation;
}

export class PortfolioController {
  /**
   * Get all portfolio projects and hero settings
   */
  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = readVideosJson();
      res.status(200).json({
        success: true,
        data
      });
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Add a new project
   */
  static async addProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, category, cat_label, meta, file, size, thumb_color } = req.body;
      if (!title || !category || !file) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Title, category, and file are required.' }
        });
        return;
      }

      const data = readVideosJson();
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const newId = `project-${slug}-${Date.now().toString(36).slice(-4)}`;
      const newAssetId = `asset-${slug}`;

      const newProject: PortfolioProject = {
        id: newId,
        assetId: newAssetId,
        file: file,
        title: title.trim(),
        category: category.toLowerCase().trim(),
        cat_label: cat_label || `${category.charAt(0).toUpperCase() + category.slice(1)} · 4K HDR`,
        meta: meta || 'Showcase Project — ' + new Date().getFullYear(),
        size: size || 'card-md',
        thumb_color: thumb_color || 'thumb-1',
        thumb_glow: [
          { w: 220, h: 220, color: 'rgba(201,168,76,0.35)', top: '20%', left: '25%' },
          { w: 140, h: 140, color: 'rgba(255,200,80,0.25)', bottom: '20%', right: '20%', delay: '-2s' }
        ]
      };

      data.portfolio.push(newProject);
      await writeVideosJson(data, req.body.expectedVersion);

      res.status(201).json({
        success: true,
        data: newProject,
        version: data.version,
        message: 'Project created and added to portfolio successfully.'
      });
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Update an existing project
   */
  static async updateProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const data = readVideosJson();
      const index = data.portfolio.findIndex(p => p.id === id);

      if (index === -1) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Project not found.' }
        });
        return;
      }

      const existing = data.portfolio[index];
      const { title, category, cat_label, meta, file, assetId, size, thumb, thumb_color } = req.body;
      const updated: PortfolioProject = {
        ...existing,
        ...(title !== undefined && { title }),
        ...(category !== undefined && { category }),
        ...(cat_label !== undefined && { cat_label }),
        ...(meta !== undefined && { meta }),
        ...(file !== undefined && { file }),
        ...(assetId !== undefined && { assetId }),
        ...(size !== undefined && { size }),
        ...(thumb !== undefined && { thumb }),
        ...(thumb_color !== undefined && { thumb_color }),
        id: existing.id // strictly preserve original id
      };

      data.portfolio[index] = updated;
      await writeVideosJson(data, req.body.expectedVersion);

      // Invalidate any stale vault cache for this project so the new video is vaulted immediately
      if (file && file !== existing.file) {
        try {
          const vaultDir = path.resolve(ROOT_DIR, 'backend', 'storage', 'private');
          const staleVaultNames = [
            `${(existing.id || 'vault').replace(/[^a-zA-Z0-9_-]/g, '_')}_master.enc`,
            `${(existing.assetId || 'asset').replace(/[^a-zA-Z0-9_-]/g, '_')}_master.enc`
          ];
          for (const sName of staleVaultNames) {
            const sPath = path.join(vaultDir, sName);
            if (fs.existsSync(sPath)) {
              fs.unlinkSync(sPath);
            }
          }
        } catch (_) {}
      }

      res.status(200).json({
        success: true,
        data: updated,
        version: data.version,
        message: 'Project updated successfully.'
      });
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Delete a project
   */
  static async deleteProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const data = readVideosJson();
      const initialLength = data.portfolio.length;
      data.portfolio = data.portfolio.filter(p => p.id !== id);

      if (data.portfolio.length === initialLength) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Project not found.' }
        });
        return;
      }

      await writeVideosJson(data, req.body.expectedVersion);

      res.status(200).json({
        success: true,
        version: data.version,
        message: 'Project removed from portfolio.'
      });
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Update Hero section video configuration
   */
  static async updateHero(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { src, label, badge, expectedVersion } = req.body;
      const data = readVideosJson();

      data.hero = {
        ...data.hero,
        ...(src ? { src } : {}),
        ...(label ? { label } : {}),
        ...(badge ? { badge } : {})
      };

      await writeVideosJson(data, expectedVersion);

      res.status(200).json({
        success: true,
        data: data.hero,
        version: data.version,
        message: 'Hero section configuration updated.'
      });
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Update Featured Showcase section video configuration
   */
  static async updateShowcase(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { expectedVersion, ...showcaseUpdates } = req.body;
      const data = readVideosJson();
      const current = data.showcase || {
        title: '<em>Urban</em><br>Mirage',
        plainTitle: 'Urban Mirage',
        assetId: 'asset-urban-mirage',
        file: 'uploaded-video/no-1.mp4',
        category: 'Commercial · 4K HDR',
        badge: 'Featured',
        description: 'An architectural visual symphony — this commercial campaign captured the interplay of light, glass, and geometric symmetry through precision cinematography and master color grading.',
        productionTime: '4 wks',
        locations: '2 cities',
        resolution: '4K HDR',
        duration: '2:34 / 4:12',
        progress: '61%'
      };

      data.showcase = {
        ...current,
        ...showcaseUpdates
      };

      // Do not mutate portfolio project cards when Showcase is updated; keep them independent
      await writeVideosJson(data, expectedVersion);

      // Invalidate any stale vault cache for showcase and project
      if (showcaseUpdates.file && showcaseUpdates.file !== current.file) {
        try {
          const vaultDir = path.resolve(ROOT_DIR, 'backend', 'storage', 'private');
          const staleVaultNames = [
            'showcase_master.enc',
            'urban_mirage_master.enc',
            'project-urban-mirage_master.enc'
          ];
          for (const sName of staleVaultNames) {
            const sPath = path.join(vaultDir, sName);
            if (fs.existsSync(sPath)) {
              fs.unlinkSync(sPath);
            }
          }
        } catch (_) {}
      }

      res.status(200).json({
        success: true,
        data: data.showcase,
        version: data.version,
        message: 'Featured showcase section updated successfully.'
      });
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Direct video file upload for portfolio replacement
   */
  static async uploadVideoAsset(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: { code: 'NO_FILE', message: 'No video file received in upload request.' }
        });
        return;
      }

      const filePath = req.file.path;
      if (!filePath || !fs.existsSync(filePath)) {
        res.status(400).json({
          success: false,
          error: { code: 'UPLOAD_FAILED', message: 'Temporary upload file not accessible.' }
        });
        return;
      }

      // Read initial 256 bytes for magic byte verification
      const fd = fs.openSync(filePath, 'r');
      const headerBuf = Buffer.alloc(256);
      const bytesRead = fs.readSync(fd, headerBuf, 0, 256, 0);
      fs.closeSync(fd);

      const headerSlice = headerBuf.subarray(0, bytesRead);
      const signatureResult = UploadService.verifyFileSignature(headerSlice);

      if (!signatureResult.valid || !signatureResult.mimeType?.startsWith('video/')) {
        // Remove rogue uploaded temp file
        try { fs.unlinkSync(filePath); } catch {}
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_SIGNATURE',
            message: 'File content does not match a valid video signature (MP4/WebM/QuickTime required).'
          }
        });
        return;
      }

      const uploadedVideoDir = path.join(ROOT_DIR, 'uploaded-video');
      if (!fs.existsSync(uploadedVideoDir)) {
        fs.mkdirSync(uploadedVideoDir, { recursive: true });
      }

      const ext = path.extname(req.file.originalname).toLowerCase() || '.mp4';
      const cleanName = path.basename(req.file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `custom_${Date.now().toString(36)}_${cleanName}${ext}`;
      const targetPath = path.join(uploadedVideoDir, filename);

      // Move the disk-backed temporary upload without blocking other requests.
      await fs.promises.copyFile(filePath, targetPath);
      await fs.promises.unlink(filePath).catch(() => {});

      const relativePath = `uploaded-video/${filename}`;

      res.status(200).json({
        success: true,
        data: {
          filePath: relativePath,
          originalName: req.file.originalname,
          size: req.file.size
        },
        message: 'Video file uploaded and ready for replacement.'
      });
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * List all available video files in uploaded-video directory
   */
  static async getAvailableVideos(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const uploadedVideoDir = path.join(ROOT_DIR, 'uploaded-video');
      if (!fs.existsSync(uploadedVideoDir)) {
        res.status(200).json({ success: true, data: [] });
        return;
      }

      const files = await fs.promises.readdir(uploadedVideoDir);
      const videoExts = ['.mp4', '.webm', '.mov', '.m4v'];
      const videoFiles = files.filter(f => videoExts.includes(path.extname(f).toLowerCase()));

      const list = videoFiles.map(filename => {
        let label = filename;
        if (filename === 'no-1.mp4') {
          label = 'Video 1 — Showreel / Urban Mirage (4K HDR)';
        } else if (filename === 'no-2.mp4') {
          label = 'Video 2 — SUN ONLIGHT / Motorsport (4K HDR)';
        } else if (filename.startsWith('custom_')) {
          const parts = filename.replace(/^custom_[a-zA-Z0-9]+_/, '').replace(/\.[^/.]+$/, '');
          const clean = parts.replace(/_/g, ' ');
          label = `Uploaded: ${clean}`;
        }
        return {
          label,
          path: `uploaded-video/${filename}`,
          filename
        };
      });

      // Place default no-1 and no-2 at top, followed by most recent uploads
      list.sort((a, b) => {
        if (a.filename === 'no-1.mp4') return -1;
        if (b.filename === 'no-1.mp4') return 1;
        if (a.filename === 'no-2.mp4') return -1;
        if (b.filename === 'no-2.mp4') return 1;
        return a.filename.localeCompare(b.filename);
      });

      res.status(200).json({
        success: true,
        data: list
      });
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Get all notifications & global toggle status
   */
  static async getNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = readVideosJson();
      res.status(200).json({
        success: true,
        data: data.notifications || DEFAULT_NOTIFICATIONS
      });
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Update notifications configuration & active status
   */
  static async updateNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { globalEnabled, activeId, items } = req.body;
      const data = readVideosJson();

      const existingNotifs = data.notifications || DEFAULT_NOTIFICATIONS;

      const updatedNotifs: NotificationsData = {
        globalEnabled: globalEnabled !== undefined ? Boolean(globalEnabled) : existingNotifs.globalEnabled,
        activeId: activeId !== undefined ? activeId : existingNotifs.activeId,
        items: Array.isArray(items) ? items : existingNotifs.items
      };

      data.notifications = updatedNotifs;
      await writeVideosJson(data, req.body.expectedVersion);

      res.status(200).json({
        success: true,
        data: data.notifications,
        version: data.version,
        message: 'Website notification banner updated successfully.'
      });
    } catch (err: any) {
      next(err);
    }
  }
}
