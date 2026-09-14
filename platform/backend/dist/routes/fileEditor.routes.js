"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fileEditor_controller_1 = require("../controllers/fileEditor.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Only SUPER_ADMIN can inspect or edit core server/website files
router.use(auth_middleware_1.authenticateAdmin);
router.use((0, auth_middleware_1.requireRole)(['SUPER_ADMIN']));
router.get('/tree', fileEditor_controller_1.FileEditorController.getFileTree);
router.get('/read', fileEditor_controller_1.FileEditorController.readFile);
router.put('/write', fileEditor_controller_1.FileEditorController.writeFile);
exports.default = router;
