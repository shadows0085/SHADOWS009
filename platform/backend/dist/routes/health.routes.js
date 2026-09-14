"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const health_controller_1 = require("../controllers/health.controller");
const router = (0, express_1.Router)();
router.get('/live', health_controller_1.HealthController.liveness);
router.get('/ready', health_controller_1.HealthController.readiness);
router.get('/', health_controller_1.HealthController.readiness);
exports.default = router;
