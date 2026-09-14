"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_PERMISSIONS = void 0;
exports.ROLE_PERMISSIONS = {
    SUPER_ADMIN: [
        'video:read',
        'video:create',
        'video:update',
        'video:publish',
        'video:delete',
        'video:stream',
        'admin:read',
        'admin:create',
        'admin:update',
        'admin:delete',
        'audit:read',
        'security:manage',
        'analytics:read'
    ],
    ADMIN: [
        'video:read',
        'video:create',
        'video:update',
        'video:publish',
        'video:delete',
        'video:stream',
        'admin:read',
        'audit:read',
        'analytics:read'
    ],
    EDITOR: [
        'video:read',
        'video:create',
        'video:update',
        'video:stream',
        'analytics:read'
    ]
};
