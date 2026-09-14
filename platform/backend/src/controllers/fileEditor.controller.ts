import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

// Root directory of the entire project
const ROOT_DIR = path.resolve(__dirname, '../../../../');

// STRICT ALLOWLIST: Only safe content directories and templates can be viewed/edited by CMS
const ALLOWED_ROOT_DIRECTORIES = [
  'data',
  'css',
  'js',
  'assets'
];

const ALLOWED_ROOT_FILES = [
  'index.html',
  'README.md'
];

// Blocked files/patterns to prevent leaking secrets, database records, environment configurations, or backend server code
const BLOCKED_PATTERNS = [
  'node_modules',
  '.git',
  '.sqlite',
  '.db',
  '.env',
  'platform',
  'backend',
  'server.js',
  'package.json',
  'package-lock.json',
  'tsconfig',
  'prisma',
  '.bak',
  '.tmp'
];

function isPathPermitted(normalizedRelPath: string): boolean {
  const clean = normalizedRelPath.replace(/\\/g, '/').replace(/^\/+/, '');
  if (!clean) return false;

  // Check blocked patterns
  const lower = clean.toLowerCase();
  for (const blocked of BLOCKED_PATTERNS) {
    if (lower.includes(blocked.toLowerCase())) {
      return false;
    }
  }

  // Check allowed root files
  if (ALLOWED_ROOT_FILES.includes(clean)) {
    return true;
  }

  // Check allowed directories
  const firstSegment = clean.split('/')[0];
  return ALLOWED_ROOT_DIRECTORIES.includes(firstSegment);
}

interface FileNode {
  name: string;
  path: string;
  isDir: boolean;
  size?: number;
  children?: FileNode[];
}

function buildTree(dirPath: string, relativePath = '', depth = 0): FileNode[] {
  if (depth > 4) return [];
  if (!fs.existsSync(dirPath)) return [];

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const nodes: FileNode[] = [];

  for (const entry of entries) {
    if (BLOCKED_PATTERNS.some(b => entry.name.toLowerCase() === b.toLowerCase())) {
      continue;
    }

    const fullPath = path.join(dirPath, entry.name);
    const rel = relativePath ? `${relativePath}/${entry.name}` : entry.name;

    // Only include permitted paths in tree
    if (depth === 0) {
      if (!ALLOWED_ROOT_FILES.includes(entry.name) && !ALLOWED_ROOT_DIRECTORIES.includes(entry.name)) {
        continue;
      }
    } else {
      if (!isPathPermitted(rel)) {
        continue;
      }
    }

    if (entry.isDirectory()) {
      nodes.push({
        name: entry.name,
        path: rel,
        isDir: true,
        children: buildTree(fullPath, rel, depth + 1)
      });
    } else {
      let size = 0;
      try {
        const stats = fs.statSync(fullPath);
        size = stats.size;
      } catch {}
      nodes.push({
        name: entry.name,
        path: rel,
        isDir: false,
        size
      });
    }
  }

  return nodes.sort((a, b) => {
    if (a.isDir === b.isDir) return a.name.localeCompare(b.name);
    return a.isDir ? -1 : 1;
  });
}

export class FileEditorController {
  /**
   * Get file tree of the project
   */
  static async getFileTree(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tree = buildTree(ROOT_DIR);
      res.status(200).json({
        success: true,
        data: tree
      });
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Read file content
   */
  static async readFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const targetRel = req.query.path as string;
      if (!targetRel) {
        res.status(400).json({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Path parameter required' }
        });
        return;
      }

      const normalized = path.normalize(targetRel).replace(/^(\.\.[\/\\])+/, '');
      
      // Strict allowlist validation
      if (!isPathPermitted(normalized)) {
        res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Access to this file path is restricted.' }
        });
        return;
      }

      const fullPath = path.resolve(ROOT_DIR, normalized);

      // Path traversal check
      if (!fullPath.startsWith(ROOT_DIR)) {
        res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Access outside root directory denied.' }
        });
        return;
      }

      if (!fs.existsSync(fullPath)) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'File not found.' }
        });
        return;
      }

      const stats = fs.statSync(fullPath);
      if (stats.isDirectory()) {
        res.status(400).json({
          success: false,
          error: { code: 'IS_DIRECTORY', message: 'Target is a directory, not a file.' }
        });
        return;
      }

      // Check max editable size (2MB)
      if (stats.size > 2 * 1024 * 1024) {
        res.status(400).json({
          success: false,
          error: { code: 'FILE_TOO_LARGE', message: 'File exceeds 2MB editable limit.' }
        });
        return;
      }

      const content = fs.readFileSync(fullPath, 'utf-8');
      res.status(200).json({
        success: true,
        data: {
          path: normalized,
          size: stats.size,
          lastModified: stats.mtime,
          content
        }
      });
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Save / overwrite file content with atomic backup
   */
  static async writeFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { path: targetRel, content } = req.body;
      if (!targetRel || typeof content !== 'string') {
        res.status(400).json({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Path and content string required.' }
        });
        return;
      }

      const normalized = path.normalize(targetRel).replace(/^(\.\.[\/\\])+/, '');
      
      // Strict allowlist validation
      if (!isPathPermitted(normalized)) {
        res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Editing this file path is strictly forbidden.' }
        });
        return;
      }

      const fullPath = path.resolve(ROOT_DIR, normalized);

      // Path traversal check
      if (!fullPath.startsWith(ROOT_DIR)) {
        res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Access outside root directory denied.' }
        });
        return;
      }

      // Create directory if not existing
      const parentDir = path.dirname(fullPath);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }

      // Backup before overwrite if file exists
      if (fs.existsSync(fullPath)) {
        try {
          fs.copyFileSync(fullPath, `${fullPath}.bak`);
        } catch {}
      }

      // Atomic write
      const tempPath = `${fullPath}.tmp.${Date.now()}`;
      fs.writeFileSync(tempPath, content, 'utf-8');
      fs.renameSync(tempPath, fullPath);

      res.status(200).json({
        success: true,
        message: 'File saved successfully.',
        data: {
          path: normalized,
          size: Buffer.byteLength(content, 'utf-8')
        }
      });
    } catch (err: any) {
      next(err);
    }
  }
}
