"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAdminSchema = exports.createAdminSchema = exports.changePasswordSchema = exports.passwordComplexitySchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().min(1, 'Username or Email is required'),
    password: zod_1.z.string().min(1, 'Password is required')
});
exports.passwordComplexitySchema = zod_1.z
    .string()
    .min(10, 'Password must be at least 10 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number');
exports.changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(1, 'Current password is required'),
    newPassword: exports.passwordComplexitySchema
});
exports.createAdminSchema = zod_1.z.object({
    email: zod_1.z.string().email('Valid email is required'),
    password: exports.passwordComplexitySchema,
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
    role: zod_1.z.enum(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
});
exports.updateAdminSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters').optional(),
    email: zod_1.z.string().email('Valid email is required').optional(),
    role: zod_1.z.enum(['SUPER_ADMIN', 'ADMIN', 'EDITOR']).optional(),
    isActive: zod_1.z.boolean().optional(),
    password: exports.passwordComplexitySchema.optional()
});
