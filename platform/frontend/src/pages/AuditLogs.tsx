import React, { useEffect, useState } from 'react';
import { ApiClient } from '../services/api';
import { AuditLogItem, PaginationMeta } from '../types';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '20'
    });
    if (actionFilter) params.append('action', actionFilter);

    const res = await ApiClient.request<AuditLogItem[]>(`/api/v1/audit-logs?${params.toString()}`);
    if (res.success && res.data) {
      setLogs(res.data);
      if (res.meta) setMeta(res.meta);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Security Audit Trail</h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">Append-Only Cryptographic Mutation Records</p>
        </div>

        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={actionFilter}
            onChange={e => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-brand-gold/50"
          >
            <option value="">All Actions</option>
            <option value="LOGIN_SUCCESS">LOGIN_SUCCESS</option>
            <option value="LOGIN_FAILED_BAD_PASSWORD">LOGIN_FAILED</option>
            <option value="ACCOUNT_LOCKED_FAILED_ATTEMPTS">ACCOUNT_LOCKED</option>
            <option value="VIDEO_CREATED">VIDEO_CREATED</option>
            <option value="VIDEO_UPDATED">VIDEO_UPDATED</option>
            <option value="VIDEO_DELETED">VIDEO_DELETED</option>
            <option value="TOKEN_ROTATED">TOKEN_ROTATED</option>
            <option value="PASSWORD_CHANGED_SUCCESS">PASSWORD_CHANGED</option>
          </select>
        </div>
      </div>

      <div className="glass-panel rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 font-mono uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Timestamp</th>
                <th className="px-6 py-3.5">Security Event</th>
                <th className="px-6 py-3.5">Actor</th>
                <th className="px-6 py-3.5">Resource</th>
                <th className="px-6 py-3.5">IP Address</th>
                <th className="px-6 py-3.5">Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono text-[11px]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Querying append-only security logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No security events recorded under current filter.
                  </td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition">
                    <td className="px-6 py-3 text-slate-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        log.action.includes('SUCCESS') ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                        log.action.includes('FAILED') || log.action.includes('LOCKED') ? 'bg-red-500/15 text-red-400 border border-red-500/30' :
                        'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-300 font-sans">
                      {log.admin?.name || log.adminId || 'System / Guest'}
                    </td>
                    <td className="px-6 py-3 text-slate-400">
                      {log.resourceType ? `${log.resourceType} (${log.resourceId?.slice(0, 8) || ''})` : '—'}
                    </td>
                    <td className="px-6 py-3 text-slate-400">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                    <td className="px-6 py-3 text-slate-500 max-w-[200px] truncate">
                      {log.metadata ? JSON.stringify(log.metadata) : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>Total Records: {meta.total}</span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={page >= meta.totalPages}
              onClick={() => setPage(p => p + 1)}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
