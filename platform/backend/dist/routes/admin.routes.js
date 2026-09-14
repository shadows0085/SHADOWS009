"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const audit_controller_1 = require("../controllers/audit.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const auth_validator_1 = require("../validators/auth.validator");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticateAdmin);
router.get('/', (0, auth_middleware_1.requirePermission)('admin:read'), audit_controller_1.AdminController.list);
router.post('/', (0, auth_middleware_1.requirePermission)('admin:create'), (0, validation_middleware_1.validateRequest)({ body: auth_validator_1.createAdminSchema }), audit_controller_1.AdminController.create);
router.put('/:id', (0, auth_middleware_1.requirePermission)('admin:update'), (0, validation_middleware_1.validateRequest)({
    params: zod_1.z.object({ id: zod_1.z.string().uuid() }),
    body: auth_validator_1.updateAdminSchema
}), audit_controller_1.AdminController.update);
router.patch('/:id/status', (0, auth_middleware_1.requirePermission)('admin:update'), (0, validation_middleware_1.validateRequest)({
    params: zod_1.z.object({ id: zod_1.z.string().uuid() }),
    body: zod_1.z.object({ isActive: zod_1.z.boolean() })
}), audit_controller_1.AdminController.toggleStatus);
router.delete('/:id', (0, auth_middleware_1.requirePermission)('admin:delete'), (0, validation_middleware_1.validateRequest)({
    params: zod_1.z.object({ id: zod_1.z.string().uuid() })
}), audit_controller_1.AdminController.delete);
router.get('/:id/activity', (0, auth_middleware_1.requirePermission)('admin:read'), (0, validation_middleware_1.validateRequest)({
    params: zod_1.z.object({ id: zod_1.z.string().uuid() })
}), audit_controller_1.AdminController.getActivity);
exports.default = router;
