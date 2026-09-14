"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const audit_controller_1 = require("../controllers/audit.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticateAdmin);
router.get('/', (0, auth_middleware_1.requirePermission)('audit:read'), audit_controller_1.AuditController.list);
exports.default = router;
