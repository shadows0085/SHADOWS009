import React, { useEffect, useState } from 'react';
import { ApiClient } from '../services/api';
import { SessionItem } from '../types';
import { Key, LogOut, Laptop, CheckCircle2, AlertTriangle } from 'lucide-react';

export const SecuritySettingsPage: React.FC = () => {
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loadingSessions, setLoadingSessions] = useState(true);
  const [submittingPass, setSubmittingPass] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);

  const fetchSessions = async () => {
    setLoadingSessions(true);
    const res = await ApiClient.request<{ sessions: SessionItem[] }>('/api/v1/auth/sessions');
    if (res.success && res.data) {
      setSessions(res.data.sessions);
    }
    setLoadingSessions(false);
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    if (newPassword !== confirmPassword) {
      setPassError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 10) {
      setPassError('New password must be at least 10 characters long.');
      return;
    }

    setSubmittingPass(true);
    const res = await ApiClient.request('/api/v1/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword })
    });

    if (res.success) {
      setPassSuccess('Password successfully updated. All other active sessions have been revoked.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      fetchSessions();
    } else {
      setPassError(res.error?.message || 'Password update failed.');
    }
    setSubmittingPass(false);
  };

  const handleRevokeAllSessions = async () => {
    if (!confirm('Terminate all active sessions? You will need to log in again.')) return;

    await ApiClient.request('/api/v1/auth/sessions/revoke-all', { method: 'POST' });
    window.location.href = '/admin/login';
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Security Command Center</h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">Session Tokens, Cryptographic Rotation & Credentials</p>
      </div>

      {/* Password Rotation Card */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-brand-gold/15 text-brand-gold border border-brand-gold/30">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-200">Rotate Administrator Password</h2>
            <p className="text-xs text-slate-400">Changing your password invalidates all current refresh sessions immediately.</p>
          </div>
        </div>

        {passError && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{passError}</span>
          </div>
        )}

        {passSuccess && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{passSuccess}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">CURRENT PASSWORD</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-brand-gold/60"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">NEW PASSWORD (MIN 10 CHARS)</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-brand-gold/60"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">CONFIRM NEW PASSWORD</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-brand-gold/60"
            />
          </div>

          <button
            type="submit"
            disabled={submittingPass}
            className="px-5 py-2.5 rounded-lg bg-brand-gold hover:bg-brand-goldHover text-dark-900 font-bold text-xs transition"
          >
            {submittingPass ? 'Rotating...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Active Sessions Card */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-200">Active Refresh Sessions</h2>
              <p className="text-xs text-slate-400">Authenticated devices currently holding rotated token keys.</p>
            </div>
          </div>

          <button
            onClick={handleRevokeAllSessions}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600/30 text-xs font-mono transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Revoke All Sessions</span>
          </button>
        </div>

        <div className="divide-y divide-slate-800 font-mono text-xs">
          {loadingSessions ? (
            <div className="py-6 text-center text-slate-500">Querying session store...</div>
          ) : sessions.length === 0 ? (
            <div className="py-6 text-center text-slate-500">No active refresh sessions.</div>
          ) : (
            sessions.map(s => (
              <div key={s.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-slate-200 font-semibold">{s.ipAddress || '127.0.0.1'}</p>
                  <p className="text-[10px] text-slate-500 truncate max-w-sm">{s.userAgent || 'Modern Browser'}</p>
                </div>
                <div className="text-right text-[11px] text-slate-400">
                  <p>Created: {new Date(s.createdAt).toLocaleDateString()}</p>
                  <p className="text-[10px] text-emerald-400">Expires: {new Date(s.expiresAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
