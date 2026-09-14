import { AuditRepository } from '../repositories/audit.repository';

export class AuditService {
  static async record(params: {
    adminId?: string | null;
    action: string;
    resourceType?: string;
    resourceId?: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, any>;
  }) {
    return AuditRepository.record(params);
  }

  static async listAuditLogs(params: {
    page?: number;
    limit?: number;
    adminId?: string;
    action?: string;
  }) {
    return AuditRepository.list(params);
  }
}
