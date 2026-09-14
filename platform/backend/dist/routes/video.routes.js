"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const video_controller_1 = require("../controllers/video.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const video_validator_1 = require("../validators/video.validator");
const router = (0, express_1.Router)();
// Public signed streaming route (authenticated via HMAC token)
router.get('/stream/:ticket', video_controller_1.VideoController.streamMedia);
// Protected video operations
router.use(auth_middleware_1.authenticateAdmin);
router.get('/', (0, auth_middleware_1.requirePermission)('video:read'), (0, validation_middleware_1.validateRequest)({ query: video_validator_1.videoQuerySchema }), video_controller_1.VideoController.list);
router.get('/metrics', (0, auth_middleware_1.requirePermission)('analytics:read'), video_controller_1.VideoController.getMetrics);
router.get('/:id', (0, auth_middleware_1.requirePermission)('video:read'), video_controller_1.VideoController.getById);
router.get('/:id/ticket', (0, auth_middleware_1.requirePermission)('video:stream'), video_controller_1.VideoController.getStreamTicket);
router.post('/', (0, auth_middleware_1.requirePermission)('video:create'), (0, validation_middleware_1.validateRequest)({ body: video_validator_1.createVideoSchema }), video_controller_1.VideoController.create);
router.put('/:id', (0, auth_middleware_1.requirePermission)('video:update'), (0, validation_middleware_1.validateRequest)({ body: video_validator_1.updateVideoSchema }), video_controller_1.VideoController.update);
router.patch('/:id/status', (0, auth_middleware_1.requirePermission)('video:publish'), video_controller_1.VideoController.updateStatus);
router.delete('/:id', (0, auth_middleware_1.requirePermission)('video:delete'), video_controller_1.VideoController.delete);
exports.default = router;
