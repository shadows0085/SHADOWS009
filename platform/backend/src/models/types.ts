export type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR';

export type VideoStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type VideoVisibility = 'PUBLIC' | 'PRIVATE' | 'UNLISTED';

export type UploadStatus = 'INITIATED' | 'UPLOADING' | 'COMPLETED' | 'ABORTED';

export type Permission =
  | 'video:read'
  | 'video:create'
  | 'video:update'
  | 'video:publish'
  | 'video:delete'
  | 'video:stream'
  | 'admin:read'
  | 'admin:create'
  | 'admin:update'
  | 'admin:delete'
  | 'audit:read'
  | 'security:manage'
  | 'analytics:read';

export const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
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

export interface AuthenticatedAdminPayload {
  adminId: string;
  email: string;
  role: AdminRole;
  name: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface StreamTicketPayload {
  videoId: string;
  adminId?: string;
  role?: string;
  nonce: string;
  issuedAt: number;
  expiresAt: number;
  clientHash: string;
}
