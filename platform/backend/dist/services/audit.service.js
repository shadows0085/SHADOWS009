"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const audit_repository_1 = require("../repositories/audit.repository");
class AuditService {
    static async record(params) {
        return audit_repository_1.AuditRepository.record(params);
    }
    static async listAuditLogs(params) {
        return audit_repository_1.AuditRepository.list(params);
    }
}
exports.AuditService = AuditService;
