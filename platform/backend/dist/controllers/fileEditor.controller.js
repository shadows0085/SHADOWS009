"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileEditorController = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Root directory of the entire project
const ROOT_DIR = path_1.default.resolve(__dirname, '../../../../');
// STRICT ALLOWLIST: Only safe content directories and templates can be viewed/edited by CMS
const ALLOWED_ROOT_DIRECTORIES = [
    'data',
    'preview_fluid_nebula',
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
function isPathPermitted(normalizedRelPath) {
    const clean = normalizedRelPath.replace(/\\/g, '/').replace(/^\/+/, '');
    if (!clean || clean.includes('..'))
        return false;
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
function buildTree(dirPath, relativePath = '', depth = 0) {
    if (depth > 4)
        return [];
    if (!fs_1.default.existsSync(dirPath))
        return [];
    const entries = fs_1.default.readdirSync(dirPath, { withFileTypes: true });
    const nodes = [];
    for (const entry of entries) {
        if (BLOCKED_PATTERNS.some(b => entry.name.toLowerCase() === b.toLowerCase())) {
            continue;
        }
        const fullPath = path_1.default.join(dirPath, entry.name);
        const rel = relativePath ? `${relativePath}/${entry.name}` : entry.name;
        // Only include permitted paths in tree
        if (depth === 0) {
            if (!ALLOWED_ROOT_FILES.includes(entry.name) && !ALLOWED_ROOT_DIRECTORIES.includes(entry.name)) {
                continue;
            }
        }
        else {
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
        }
        else {
            let size = 0;
            try {
                const stats = fs_1.default.statSync(fullPath);
                size = stats.size;
            }
            catch { }
            nodes.push({
                name: entry.name,
                path: rel,
                isDir: false,
                size
            });
        }
    }
    return nodes.sort((a, b) => {
        if (a.isDir === b.isDir)
            return a.name.localeCompare(b.name);
        return a.isDir ? -1 : 1;
    });
}
class FileEditorController {
    /**
     * Get file tree of the project
     */
    static async getFileTree(req, res, next) {
        try {
            const tree = buildTree(ROOT_DIR);
            res.status(200).json({
                success: true,
                data: tree
            });
        }
        catch (err) {
            next(err);
        }
    }
    /**
     * Read file content
     */
    static async readFile(req, res, next) {
        try {
            const targetRel = req.query.path;
            if (!targetRel) {
                res.status(400).json({
                    success: false,
                    error: { code: 'BAD_REQUEST', message: 'Path parameter required' }
                });
                return;
            }
            const normalized = path_1.default.normalize(targetRel).replace(/^(\.\.[\/\\])+/, '');
            // Strict allowlist validation
            if (!isPathPermitted(normalized)) {
                res.status(403).json({
                    success: false,
                    error: { code: 'FORBIDDEN', message: 'Access to this file path is restricted.' }
                });
                return;
            }
            const fullPath = path_1.default.resolve(ROOT_DIR, normalized);
            // Path traversal check
            if (!fullPath.startsWith(ROOT_DIR)) {
                res.status(403).json({
                    success: false,
                    error: { code: 'FORBIDDEN', message: 'Access outside root directory denied.' }
                });
                return;
            }
            if (!fs_1.default.existsSync(fullPath)) {
                res.status(404).json({
                    success: false,
                    error: { code: 'NOT_FOUND', message: 'File not found.' }
                });
                return;
            }
            const stats = fs_1.default.statSync(fullPath);
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
            const content = fs_1.default.readFileSync(fullPath, 'utf-8');
            res.status(200).json({
                success: true,
                data: {
                    path: normalized,
                    size: stats.size,
                    lastModified: stats.mtime,
                    content
                }
            });
        }
        catch (err) {
            next(err);
        }
    }
    /**
     * Save / overwrite file content with atomic backup
     */
    static async writeFile(req, res, next) {
        try {
            const { path: targetRel, content } = req.body;
            if (!targetRel || typeof content !== 'string') {
                res.status(400).json({
                    success: false,
                    error: { code: 'BAD_REQUEST', message: 'Path and content string required.' }
                });
                return;
            }
            const normalized = path_1.default.normalize(targetRel).replace(/^(\.\.[\/\\])+/, '');
            // Strict allowlist validation
            if (!isPathPermitted(normalized)) {
                res.status(403).json({
                    success: false,
                    error: { code: 'FORBIDDEN', message: 'Editing this file path is strictly forbidden.' }
                });
                return;
            }
            const fullPath = path_1.default.resolve(ROOT_DIR, normalized);
            // Path traversal check
            if (!fullPath.startsWith(ROOT_DIR)) {
                res.status(403).json({
                    success: false,
                    error: { code: 'FORBIDDEN', message: 'Access outside root directory denied.' }
                });
                return;
            }
            // Create directory if not existing
            const parentDir = path_1.default.dirname(fullPath);
            if (!fs_1.default.existsSync(parentDir)) {
                fs_1.default.mkdirSync(parentDir, { recursive: true });
            }
            // Backup before overwrite if file exists
            if (fs_1.default.existsSync(fullPath)) {
                try {
                    fs_1.default.copyFileSync(fullPath, `${fullPath}.bak`);
                }
                catch { }
            }
            // Atomic write
            const tempPath = `${fullPath}.tmp.${Date.now()}`;
            fs_1.default.writeFileSync(tempPath, content, 'utf-8');
            fs_1.default.renameSync(tempPath, fullPath);
            res.status(200).json({
                success: true,
                message: 'File saved successfully.',
                data: {
                    path: normalized,
                    size: Buffer.byteLength(content, 'utf-8')
                }
            });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.FileEditorController = FileEditorController;
