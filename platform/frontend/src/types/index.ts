export type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR';

export type VideoStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type VideoVisibility = 'PUBLIC' | 'PRIVATE' | 'UNLISTED';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  permissions: string[];
  isActive?: boolean;
  lastLoginAt?: string;
  createdAt?: string;
}

export interface VideoItem {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  storageKey: string;
  thumbnailKey?: string | null;
  mimeType: string;
  fileSize: number;
  duration: number;
  uploadedBy: string;
  status: VideoStatus;
  visibility: VideoVisibility;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
  uploader?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface DashboardMetrics {
  totalVideos: number;
  publishedVideos: number;
  draftVideos: number;
  archivedVideos: number;
  totalStorageBytes: number;
}

export interface AuditLogItem {
  id: string;
  adminId?: string | null;
  action: string;
  resourceType?: string | null;
  resourceId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: any;
  createdAt: string;
  admin?: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SessionItem {
  id: string;
  createdAt: string;
  expiresAt: string;
  ipAddress?: string;
  userAgent?: string;
}
