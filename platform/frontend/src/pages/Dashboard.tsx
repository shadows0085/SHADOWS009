import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiClient } from '../services/api';
import { SocService, SocTelemetry } from '../services/soc.service';
import { DashboardMetrics, AuditLogItem } from '../types';
import {
  Film,
  CheckCircle2,
  FileEdit,
  HardDrive,
  UploadCloud,
  ArrowUpRight,
  ShieldAlert,
  Radio,
  Sparkles,
  Code2,
  Sliders,
  AlertOctagon,
  Bell
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [socData, setSocData] = useState<SocTelemetry | null>(null);
  const [recentLogs, setRecentLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [killswitchExecuting, setKillswitchExecuting] = useState(false);
  const [killswitchMsg, setKillswitchMsg] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [mRes, lRes, soc] = await Promise.all([
        ApiClient.request<DashboardMetrics>('/api/v1/videos/metrics'),
        ApiClient.request<AuditLogItem[]>('/api/v1/audit-logs?limit=6'),
        SocService.getTelemetry().catch(() => null)
      ]);

      if (mRes.success && mRes.data) setMetrics(mRes.data);
      if (lRes.success && lRes.data) setRecentLogs(lRes.data);
      if (soc) setSocData(soc);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // 10s live polling
    return () => clearInterval(interval);
  }, []);

  const handleKillswitch = async () => {
    if (!window.confirm('EMERGENCY KILLSWITCH: Are you sure you want to revoke ALL active streaming tokens and sessions immediately?')) {
      return;
    }
    setKillswitchExecuting(true);
    try {
      const msg = await SocService.triggerKillswitch();
      setKillswitchMsg(msg);
      setTimeout(() => setKillswitchMsg(null), 6000);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Killswitch execution failed');
    } finally {
      setKillswitchExecuting(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center h-96 text-brand-gold font-mono text-sm">
        INITIALIZING CONSOLE TELEMETRY...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome & Command Banner */}
      <div className="glass-panel p-8 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-slate-100">Unified Master Admin Console</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-gold/10 text-brand-gold border border-brand-gold/30 font-mono">
              SOC & CMS INTEGRATED
            </span>
          </div>
          <p className="text-sm text-slate-400 max-w-2xl">
            Complete defense-in-depth control: manage portfolio showcase projects, edit core files, inspect live SOC telemetry, and operate the media vault.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <Link
            to="/portfolio"
            className="px-4 py-2.5 rounded-lg bg-brand-gold/15 hover:bg-brand-gold/25 border border-brand-gold/30 text-brand-gold text-xs font-semibold flex items-center gap-2 transition"
          >
            <Sparkles className="w-4 h-4" />
            Portfolio CMS
          </Link>

          <Link
            to="/upload"
            className="px-4 py-2.5 rounded-lg bg-brand-gold hover:bg-yellow-500 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(201,168,76,0.3)] transition"
          >
            <UploadCloud className="w-4 h-4" />
            Upload Media
          </Link>
        </div>
      </div>

      {/* Website Announcement & Notification Banner Quick Access */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-brand-gold/10 border border-brand-gold/30 flex items-center justify-center text-brand-gold flex-shrink-0">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-200">Website Announcement & Notification Banner</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                3 Presets Ready
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Manage client availability alerts, production notices, and new showreel announcements on the live portfolio.
            </p>
          </div>
        </div>

        <Link
          to="/portfolio"
          className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition flex-shrink-0"
        >
          <Sliders className="w-3.5 h-3.5 text-brand-gold" />
          <span>Manage 3 Presets in CMS</span>
        </Link>
      </div>

      {/* Killswitch Alert Banner */}
      {killswitchMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-3">
          <AlertOctagon className="w-5 h-5 flex-shrink-0" />
          <span>{killswitchMsg}</span>
        </div>
      )}

      {/* SOC Real-Time Telemetry Cards (from legacy admin.html) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            Live Vault Telemetry & SOC Telemetry
          </h2>
          <button
            onClick={handleKillswitch}
            disabled={killswitchExecuting}
            className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold flex items-center gap-2 transition"
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            {killswitchExecuting ? 'Revoking...' : 'Emergency Killswitch (Revoke Tokens)'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-dark-800/80 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
              <span>Active Vault Streams</span>
              <span className="text-emerald-400">● LIVE</span>
            </div>
            <div className="text-2xl font-bold font-mono text-slate-100">
              {socData?.metrics.activeStreams ?? 0}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Authenticated range requests</p>
          </div>

          <div className="p-5 rounded-xl bg-dark-800/80 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
              <span>Blocked Attempts</span>
              <span className="text-red-400">● ENFORCED</span>
            </div>
            <div className="text-2xl font-bold font-mono text-red-400">
              {socData?.metrics.blockedAttempts ?? 0}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Expired tokens, hotlinks, scraping</p>
          </div>

          <div className="p-5 rounded-xl bg-dark-800/80 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
              <span>DevTools / Screen Deterrence</span>
              <span className="text-amber-400">● TRIPPED</span>
            </div>
            <div className="text-2xl font-bold font-mono text-amber-400">
              {socData?.metrics.devtoolsTriggers ?? 0}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Console & inspector triggers</p>
          </div>

          <div className="p-5 rounded-xl bg-dark-800/80 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
              <span>Rate Limit Incidents</span>
              <span className="text-sky-400">● THROTTLED</span>
            </div>
            <div className="text-2xl font-bold font-mono text-sky-400">
              {socData?.metrics.rateLimitViolations ?? 0}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Automated request thresholds hit</p>
          </div>
        </div>
      </div>

      {/* Core Platform Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-dark-800/60 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Total Managed Videos</span>
            <Film className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{metrics?.totalVideos ?? 0}</div>
          <p className="text-[11px] text-slate-500 mt-1">In secure database registry</p>
        </div>

        <div className="p-5 rounded-xl bg-dark-800/60 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Published Assets</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{metrics?.publishedVideos ?? 0}</div>
          <p className="text-[11px] text-slate-500 mt-1">Public visibility</p>
        </div>

        <div className="p-5 rounded-xl bg-dark-800/60 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Drafts / Private</span>
            <FileEdit className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{metrics?.draftVideos ?? 0}</div>
          <p className="text-[11px] text-slate-500 mt-1">Unlisted or restricted</p>
        </div>

        <div className="p-5 rounded-xl bg-dark-800/60 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Encrypted Vault Storage</span>
            <HardDrive className="w-4 h-4 text-brand-gold" />
          </div>
          <div className="text-2xl font-bold text-brand-gold">
            {formatBytes(metrics?.totalStorageBytes ?? 0)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">On-disk storage usage</p>
        </div>
      </div>

      {/* Navigation Quick Access Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link
          to="/portfolio"
          className="p-6 rounded-2xl bg-dark-800/50 border border-slate-800 hover:border-brand-gold/40 transition group shadow-lg"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold group-hover:scale-110 transition">
              <Sparkles className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-brand-gold transition" />
          </div>
          <h3 className="text-base font-bold text-slate-100 mb-1">Portfolio CMS</h3>
          <p className="text-xs text-slate-400">
            Edit, remove, add, or reorder showcase projects on the public website.
          </p>
        </Link>

        <Link
          to="/editor"
          className="p-6 rounded-2xl bg-dark-800/50 border border-slate-800 hover:border-brand-gold/40 transition group shadow-lg"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-110 transition">
              <Code2 className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 transition" />
          </div>
          <h3 className="text-base font-bold text-slate-100 mb-1">Core File & Code Editor</h3>
          <p className="text-xs text-slate-400">
            Browse files and edit code/templates directly with automatic backups.
          </p>
        </Link>

        <Link
          to="/site-control"
          className="p-6 rounded-2xl bg-dark-800/50 border border-slate-800 hover:border-brand-gold/40 transition group shadow-lg"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition">
              <Sliders className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition" />
          </div>
          <h3 className="text-base font-bold text-slate-100 mb-1">Live Site Controller</h3>
          <p className="text-xs text-slate-400">
            Preview the website in responsive viewports (Desktop/Tablet/Mobile).
          </p>
        </Link>
      </div>

      {/* Real-Time Security Audit Stream */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-brand-gold" />
            <h2 className="text-base font-bold text-slate-100">Security Audit Trail (SOC Stream)</h2>
          </div>
          <Link
            to="/audit-logs"
            className="text-xs text-brand-gold hover:underline flex items-center gap-1 font-mono"
          >
            View Full Logs <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] font-mono uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="pb-3 px-3">Timestamp</th>
                <th className="pb-3 px-3">Event Type</th>
                <th className="pb-3 px-3">IP Address</th>
                <th className="pb-3 px-3">Severity</th>
                <th className="pb-3 px-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {recentLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500">
                    No security incidents recorded.
                  </td>
                </tr>
              ) : (
                recentLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-3 text-slate-400">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-3 text-slate-200 font-semibold">{log.action}</td>
                    <td className="py-3 px-3 text-slate-400">{log.ipAddress}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.action.includes('REUSE') || log.action.includes('LOCKOUT') || log.action.includes('FAIL')
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        {log.action.includes('REUSE') ? 'CRITICAL' : 'INFO'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400 truncate max-w-xs">
                      {log.metadata ? JSON.stringify(log.metadata) : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
