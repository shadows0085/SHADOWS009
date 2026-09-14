"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storageService = exports.LocalStorageProvider = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
class LocalStorageProvider {
    baseDir;
    constructor() {
        this.baseDir = path_1.default.resolve(process.cwd(), env_1.env.LOCAL_STORAGE_PATH);
        this.ensureDirectory(this.baseDir);
        this.ensureDirectory(path_1.default.join(this.baseDir, 'videos'));
        this.ensureDirectory(path_1.default.join(this.baseDir, 'thumbnails'));
    }
    ensureDirectory(dirPath) {
        if (!fs_1.default.existsSync(dirPath)) {
            fs_1.default.mkdirSync(dirPath, { recursive: true });
        }
    }
    /**
     * Sanitizes relative storage key and guarantees it remains inside baseDir (Path Traversal Protection)
     */
    getAbsolutePath(storageKey) {
        const sanitizedKey = storageKey.replace(/^(\.\.[\/\\])+/, '').replace(/[\/\\]+/g, path_1.default.sep);
        const resolvedPath = path_1.default.resolve(this.baseDir, sanitizedKey);
        if (!resolvedPath.startsWith(this.baseDir)) {
            throw new Error(`SECURITY ALERT: Path traversal attempt detected: ${storageKey}`);
        }
        return resolvedPath;
    }
    async save(fileBuffer, targetKey) {
        const fullPath = this.getAbsolutePath(targetKey);
        const parentDir = path_1.default.dirname(fullPath);
        this.ensureDirectory(parentDir);
        await fs_1.default.promises.writeFile(fullPath, fileBuffer);
        const stats = await fs_1.default.promises.stat(fullPath);
        return {
            storageKey: targetKey,
            fileSize: stats.size
        };
    }
    readStream(storageKey, range) {
        const fullPath = this.getAbsolutePath(storageKey);
        if (!fs_1.default.existsSync(fullPath)) {
            throw new Error(`File not found: ${storageKey}`);
        }
        return fs_1.default.createReadStream(fullPath, range ? { start: range.start, end: range.end } : undefined);
    }
    async delete(storageKey) {
        try {
            const fullPath = this.getAbsolutePath(storageKey);
            if (fs_1.default.existsSync(fullPath)) {
                await fs_1.default.promises.unlink(fullPath);
                return true;
            }
            return false;
        }
        catch (err) {
            logger_1.logger.error({ err, storageKey }, 'Failed to delete file from storage');
            return false;
        }
    }
    async exists(storageKey) {
        const fullPath = this.getAbsolutePath(storageKey);
        return fs_1.default.existsSync(fullPath);
    }
    async getFileSize(storageKey) {
        const fullPath = this.getAbsolutePath(storageKey);
        const stats = await fs_1.default.promises.stat(fullPath);
        return stats.size;
    }
}
exports.LocalStorageProvider = LocalStorageProvider;
// Factory instantiation
exports.storageService = new LocalStorageProvider();
