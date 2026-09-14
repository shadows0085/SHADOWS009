import fs from 'fs';
import path from 'path';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export interface StorageResult {
  storageKey: string;
  fileSize: number;
}

export interface IStorageProvider {
  save(fileBuffer: Buffer, targetKey: string): Promise<StorageResult>;
  readStream(storageKey: string, range?: { start: number; end: number }): fs.ReadStream | NodeJS.ReadableStream;
  delete(storageKey: string): Promise<boolean>;
  exists(storageKey: string): Promise<boolean>;
  getFileSize(storageKey: string): Promise<number>;
  getAbsolutePath(storageKey: string): string;
}

export class LocalStorageProvider implements IStorageProvider {
  private readonly baseDir: string;

  constructor() {
    this.baseDir = path.resolve(process.cwd(), env.LOCAL_STORAGE_PATH);
    this.ensureDirectory(this.baseDir);
    this.ensureDirectory(path.join(this.baseDir, 'videos'));
    this.ensureDirectory(path.join(this.baseDir, 'thumbnails'));
  }

  private ensureDirectory(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  /**
   * Sanitizes relative storage key and guarantees it remains inside baseDir (Path Traversal Protection)
   */
  public getAbsolutePath(storageKey: string): string {
    const sanitizedKey = storageKey.replace(/^(\.\.[\/\\])+/, '').replace(/[\/\\]+/g, path.sep);
    const resolvedPath = path.resolve(this.baseDir, sanitizedKey);

    if (!resolvedPath.startsWith(this.baseDir)) {
      throw new Error(`SECURITY ALERT: Path traversal attempt detected: ${storageKey}`);
    }

    return resolvedPath;
  }

  async save(fileBuffer: Buffer, targetKey: string): Promise<StorageResult> {
    const fullPath = this.getAbsolutePath(targetKey);
    const parentDir = path.dirname(fullPath);
    this.ensureDirectory(parentDir);

    await fs.promises.writeFile(fullPath, fileBuffer);
    const stats = await fs.promises.stat(fullPath);

    return {
      storageKey: targetKey,
      fileSize: stats.size
    };
  }

  readStream(storageKey: string, range?: { start: number; end: number }): fs.ReadStream {
    const fullPath = this.getAbsolutePath(storageKey);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`File not found: ${storageKey}`);
    }

    return fs.createReadStream(fullPath, range ? { start: range.start, end: range.end } : undefined);
  }

  async delete(storageKey: string): Promise<boolean> {
    try {
      const fullPath = this.getAbsolutePath(storageKey);
      if (fs.existsSync(fullPath)) {
        await fs.promises.unlink(fullPath);
        return true;
      }
      return false;
    } catch (err) {
      logger.error({ err, storageKey }, 'Failed to delete file from storage');
      return false;
    }
  }

  async exists(storageKey: string): Promise<boolean> {
    const fullPath = this.getAbsolutePath(storageKey);
    return fs.existsSync(fullPath);
  }

  async getFileSize(storageKey: string): Promise<number> {
    const fullPath = this.getAbsolutePath(storageKey);
    const stats = await fs.promises.stat(fullPath);
    return stats.size;
  }
}

// Factory instantiation
export const storageService = new LocalStorageProvider();
