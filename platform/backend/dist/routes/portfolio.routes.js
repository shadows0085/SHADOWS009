"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const portfolio_controller_1 = require("../controllers/portfolio.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const portfolio_validator_1 = require("../validators/portfolio.validator");
const env_1 = require("../config/env");
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const zod_1 = require("zod");
const tempUploadDir = path_1.default.join(os_1.default.tmpdir(), 'secure_portfolio_uploads');
if (!fs_1.default.existsSync(tempUploadDir)) {
    try {
        fs_1.default.mkdirSync(tempUploadDir, { recursive: true });
    }
    catch { }
}
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({
    storage: multer_1.default.diskStorage({
        destination: (_req, _file, cb) => {
            cb(null, tempUploadDir);
        },
        filename: (_req, file, cb) => {
            const ext = path_1.default.extname(file.originalname).toLowerCase();
            cb(null, `upload_${Date.now()}_${Math.random().toString(36).substring(2, 9)}${ext}`);
        }
    }),
    limits: {
        // Disk-backed multer storage streams the file to a temporary directory, so
        // portfolio replacements can use the same configured video limit without
        // consuming the Node.js heap.
        fileSize: env_1.env.MAX_VIDEO_SIZE_BYTES
    },
    fileFilter: (_req, file, cb) => {
        const allowedExts = ['.mp4', '.webm', '.mov', '.m4v'];
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        if (allowedExts.includes(ext)) {
            cb(null, true);
        }
        else {
            const error = new Error('Only MP4, WebM, and QuickTime videos are allowed.');
            error.statusCode = 400;
            error.code = 'INVALID_FILE_TYPE';
            cb(error);
        }
    }
});
// Publicly readable for preview or authenticated for editing
router.get('/', portfolio_controller_1.PortfolioController.getAll);
router.get('/notifications', portfolio_controller_1.PortfolioController.getNotifications);
router.get('/videos', portfolio_controller_1.PortfolioController.getAvailableVideos);
// Protected mutations
router.use(auth_middleware_1.authenticateAdmin);
router.post('/upload', (0, auth_middleware_1.requirePermission)('video:create'), upload.single('file'), portfolio_controller_1.PortfolioController.uploadVideoAsset);
router.post('/projects', (0, auth_middleware_1.requirePermission)('video:create'), (0, validation_middleware_1.validateRequest)({ body: portfolio_validator_1.createProjectSchema }), portfolio_controller_1.PortfolioController.addProject);
router.put('/projects/:id', (0, auth_middleware_1.requirePermission)('video:update'), (0, validation_middleware_1.validateRequest)({ body: portfolio_validator_1.updateProjectSchema }), portfolio_controller_1.PortfolioController.updateProject);
router.delete('/projects/:id', (0, auth_middleware_1.requirePermission)('video:delete'), (0, validation_middleware_1.validateRequest)({ body: zod_1.z.object({ expectedVersion: zod_1.z.number().int().positive() }).strict() }), portfolio_controller_1.PortfolioController.deleteProject);
router.put('/hero', (0, auth_middleware_1.requirePermission)('video:update'), (0, validation_middleware_1.validateRequest)({ body: portfolio_validator_1.heroSchema }), portfolio_controller_1.PortfolioController.updateHero);
router.put('/showcase', (0, auth_middleware_1.requirePermission)('video:update'), (0, validation_middleware_1.validateRequest)({ body: portfolio_validator_1.showcaseSchema }), portfolio_controller_1.PortfolioController.updateShowcase);
router.put('/notifications', (0, auth_middleware_1.requirePermission)('video:update'), (0, validation_middleware_1.validateRequest)({ body: portfolio_validator_1.notificationsSchema }), portfolio_controller_1.PortfolioController.updateNotifications);
exports.default = router;
