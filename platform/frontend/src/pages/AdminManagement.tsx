import React, { useEffect, useState } from 'react';
import { ApiClient } from '../services/api';
import { AdminUser, AdminRole } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Plus,
  CheckCircle2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserX,
  Activity,
  Edit2,
  Trash2,
  Key,
  AlertTriangle,
  Info,
  Check,
  X,
  RefreshCw
} from 'lucide-react';

interface MemberActivity {
  presence: 'ONLINE' | 'IDLE' | 'OFFLINE';
  totalLogins: number;
  lastActive: string | null;
  recentLogs: Array<{
    id: string;
    action: string;
    resourceType: string;
    ipAddress?: string;
    userAgent?: string;
    createdAt: string;
  }>;
}

export const AdminManagementPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [activityAdmin, setActivityAdmin] = useState<AdminUser | null>(null);
  const [activityData, setActivityData] = useState<MemberActivity | null>(null);
  const [activityLoading, setActivityLoading] = useState(false);
  const [deletingAdmin, setDeletingAdmin] = useState<AdminUser | null>(null);

  // New admin form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<AdminRole>('EDITOR');

  // Edit admin form
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<AdminRole>('EDITOR');
  const [editStatus, setEditStatus] = useState<boolean>(true);
  const [editPassword, setEditPassword] = useState('');

  const fetchAdmins = async () => {
    setLoading(true);
    setErrorMsg(null);
    const res = await ApiClient.request<AdminUser[]>('/api/v1/admins');
    if (res.success && res.data) {
      setAdmins(Array.isArray(res.data) ? res.data : []);
    } else {
      setAdmins([]);
      setErrorMsg(res.error?.message || 'Failed to load team registry');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const flashMessage = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // Add Member
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setErrorMsg(null);

    const res = await ApiClient.request('/api/v1/admins', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role })
    });

    setActionLoading(false);
    if (res.success) {
      setShowAddModal(false);
      setName('');
      setEmail('');
      setPassword('');
      setRole('EDITOR');
      flashMessage(`Team member "${name}" created successfully.`);
      fetchAdmins();
    } else {
      setErrorMsg(res.error?.message || 'Failed to create team member.');
    }
  };

  // Open Edit Modal
  const openEditModal = (adm: AdminUser) => {
    setEditingAdmin(adm);
    setEditName(adm.name);
    setEditEmail(adm.email);
    setEditRole(adm.role);
    setEditStatus(adm.isActive ?? true);
    setEditPassword('');
    setErrorMsg(null);
  };

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;
    setActionLoading(true);
    setErrorMsg(null);

    const payload: any = {
      name: editName,
      email: editEmail,
      role: editRole,
      isActive: editStatus
    };

    if (editPassword.trim()) {
      payload.password = editPassword.trim();
    }

    const res = await ApiClient.request(`/api/v1/admins/${editingAdmin.id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });

    setActionLoading(false);
    if (res.success) {
      setEditingAdmin(null);
      flashMessage(`Administrator permissions and profile for "${editName}" updated.`);
      fetchAdmins();
    } else {
      setErrorMsg(res.error?.message || 'Failed to update member.');
    }
  };

  // Quick Toggle Status
  const handleToggleStatus = async (adm: AdminUser) => {
    const newStatus = !adm.isActive;
    const res = await ApiClient.request(`/api/v1/admins/${adm.id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive: newStatus })
    });

    if (res.success) {
      flashMessage(`Status for ${adm.name} updated to ${newStatus ? 'Active' : 'Suspended'}.`);
      fetchAdmins();
    } else {
      setErrorMsg(res.error?.message || 'Failed to toggle member status.');
    }
  };

  // Open Attendance & Activity Tracker
  const openActivityModal = async (adm: AdminUser) => {
    setActivityAdmin(adm);
    setActivityLoading(true);
    setActivityData(null);

    const res = await ApiClient.request<{ admin: AdminUser; attendance: MemberActivity }>(`/api/v1/admins/${adm.id}/activity`);
    setActivityLoading(false);

    if (res.success && res.data?.attendance) {
      setActivityData(res.data.attendance);
    } else {
      setErrorMsg('Failed to load member activity metrics.');
    }
  };

  // Delete Member
  const handleDeleteMember = async () => {
    if (!deletingAdmin) return;
    setActionLoading(true);

    const res = await ApiClient.request(`/api/v1/admins/${deletingAdmin.id}`, {
      method: 'DELETE'
    });

    setActionLoading(false);
    if (res.success) {
      flashMessage(`Member "${deletingAdmin.name}" has been revoked.`);
      setDeletingAdmin(null);
      fetchAdmins();
    } else {
      setErrorMsg(res.error?.message || 'Failed to remove member.');
    }
  };

  const getRoleBadge = (roleName: AdminRole) => {
    switch (roleName) {
      case 'SUPER_ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/30">
            <ShieldAlert className="w-3 h-3" />
            <span>SUPER ADMIN</span>
          </span>
        );
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
            <ShieldCheck className="w-3 h-3" />
            <span>ADMINISTRATOR</span>
          </span>
        );
      case 'EDITOR':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <Shield className="w-3 h-3" />
            <span>EDITOR</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <span>Team & Role Governance</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-gold/15 text-brand-gold border border-brand-gold/30 font-mono">
              RBAC v2.4
            </span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Authorize team members, check attendance & activity logs, and configure granular post permissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAdmins}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition"
            title="Refresh list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>

          <button
            onClick={() => {
              setShowAddModal(true);
              setErrorMsg(null);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-gold hover:bg-brand-goldHover text-dark-900 font-bold text-xs shadow-[0_0_20px_rgba(201,168,76,0.25)] transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Team Member</span>
          </button>
        </div>
      </div>

      {/* Feedback Alerts */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5 animate-fadeIn">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Total Members</div>
            <div className="text-xl font-bold text-slate-100 mt-0.5">{(admins || []).length}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-brand-gold">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Active Accounts</div>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">
              {(admins || []).filter(a => a.isActive).length}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Super Admins</div>
            <div className="text-xl font-bold text-purple-400 mt-0.5">
              {(admins || []).filter(a => a.role === 'SUPER_ADMIN').length}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Editors / Staff</div>
            <div className="text-xl font-bold text-amber-400 mt-0.5">
              {(admins || []).filter(a => a.role !== 'SUPER_ADMIN').length}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Shield className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="glass-panel rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <span className="text-xs font-mono text-slate-300 uppercase tracking-wider">
            Active Directory ({(admins || []).length} Personnel)
          </span>
          <span className="text-[11px] font-mono text-slate-500">
            All changes require SUPER_ADMIN clearance
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 font-mono uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Administrator</th>
                <th className="px-6 py-3.5">Email / Identifier</th>
                <th className="px-6 py-3.5">Role</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Attendance / Activity</th>
                <th className="px-6 py-3.5 text-right">Access Control Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-sans">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-mono">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-4 h-4 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
                      <span>Synchronizing RBAC security registry...</span>
                    </div>
                  </td>
                </tr>
              ) : (admins || []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-mono">
                    No administrators found in directory.
                  </td>
                </tr>
              ) : (
                admins.map(adm => {
                  const isCurrent = currentUser?.email === adm.email;

                  return (
                    <tr key={adm.id} className="hover:bg-slate-800/30 transition">
                      {/* Name & Avatar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-brand-gold/10 border border-brand-gold/30 flex items-center justify-center font-bold text-xs text-brand-gold">
                            {adm.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-100 flex items-center gap-2">
                              <span>{adm.name}</span>
                              {isCurrent && (
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                                  YOU
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              ID: {adm.id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 font-mono text-slate-300">
                        {adm.email}
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4">
                        {getRoleBadge(adm.role)}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                          adm.isActive 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${adm.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                          <span>{adm.isActive ? 'Active' : 'Suspended'}</span>
                        </span>
                      </td>

                      {/* Attendance / Activity */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => openActivityModal(adm)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-mono border border-slate-700/60 transition group"
                          title="View live attendance & audit history"
                        >
                          <Activity className="w-3.5 h-3.5 text-brand-gold group-hover:scale-110 transition" />
                          <span>Check Logs</span>
                        </button>
                      </td>

                      {/* Access Control Action Buttons */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Edit / Authorize Member */}
                          <button
                            onClick={() => openEditModal(adm)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-brand-gold/20 text-slate-300 hover:text-brand-gold border border-slate-700 hover:border-brand-gold/40 transition"
                            title="Edit profile, role, & permissions"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Toggle Status */}
                          <button
                            onClick={() => handleToggleStatus(adm)}
                            disabled={isCurrent}
                            className={`p-1.5 rounded-lg border transition ${
                              adm.isActive
                                ? 'bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border-slate-700 hover:border-red-500/40'
                                : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border-emerald-500/30'
                            } disabled:opacity-30 disabled:cursor-not-allowed`}
                            title={adm.isActive ? 'Suspend access' : 'Restore access'}
                          >
                            {adm.isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          </button>

                          {/* Delete Member */}
                          <button
                            onClick={() => setDeletingAdmin(adm)}
                            disabled={isCurrent}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500/40 transition disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Revoke and delete member"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Permissions & Capability Matrix */}
      <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-brand-gold" />
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
            Role Governance & Post Capability Matrix
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Super Admin */}
          <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-purple-300 font-mono">SUPER_ADMIN</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">Master</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Full unconstrained access to Quantum Vault, User Authorization, Security Settings, Core File Editor, and Portfolio CMS.
            </p>
            <ul className="space-y-1 text-[11px] text-slate-300 font-mono">
              <li className="flex items-center gap-1.5 text-purple-300">
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Team & Role Governance</span>
              </li>
              <li className="flex items-center gap-1.5 text-purple-300">
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Core File Code Editor</span>
              </li>
              <li className="flex items-center gap-1.5 text-purple-300">
                <Check className="w-3 h-3 text-emerald-400" />
                <span>All Video & CMS Mutations</span>
              </li>
            </ul>
          </div>

          {/* Admin */}
          <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-300 font-mono">ADMIN</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">Operations</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Manages video library, live site controllers, portfolio projects, and inspects security audit telemetry.
            </p>
            <ul className="space-y-1 text-[11px] text-slate-300 font-mono">
              <li className="flex items-center gap-1.5 text-blue-300">
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Portfolio CMS & Hero Config</span>
              </li>
              <li className="flex items-center gap-1.5 text-blue-300">
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Video Vault Stream Control</span>
              </li>
              <li className="flex items-center gap-1.5 text-blue-300">
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Audit Trail Inspection</span>
              </li>
            </ul>
          </div>

          {/* Editor */}
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-300 font-mono">EDITOR</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">Content</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Permitted to upload raw video assets and edit project metadata. Cannot access user governance or core files.
            </p>
            <ul className="space-y-1 text-[11px] text-slate-300 font-mono">
              <li className="flex items-center gap-1.5 text-amber-300">
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Upload Video Assets</span>
              </li>
              <li className="flex items-center gap-1.5 text-amber-300">
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Edit Portfolio Content</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-500">
                <X className="w-3 h-3 text-red-400" />
                <span>No Security Config Access</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* MODAL 1: ADD TEAM MEMBER */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-dark-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-brand-gold" />
                <h2 className="text-base font-bold text-slate-100">Add Team Member</h2>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateAdmin} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-mono mb-1">FULL NAME</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. John Miller"
                  className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-gold/60"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-mono mb-1">EMAIL / IDENTIFIER</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. editor@vault.local"
                  className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-gold/60"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-mono mb-1">INITIAL PASSWORD</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min 10 chars (uppercase, lowercase, number)"
                  className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-gold/60"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-mono mb-1">ROLE & POST ASSIGNMENT</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as AdminRole)}
                  className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-brand-gold/60"
                >
                  <option value="EDITOR">Editor — Video Upload & Content Updates</option>
                  <option value="ADMIN">Admin — Full CMS, Videos & Telemetry</option>
                  <option value="SUPER_ADMIN">Super Admin — Master Security & Team Governance</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-lg bg-brand-gold hover:bg-brand-goldHover text-dark-900 font-bold transition disabled:opacity-50"
                >
                  {actionLoading ? 'Creating...' : 'Authorize Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT MEMBER / ROLE / STATUS / PASSWORD */}
      {editingAdmin && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-dark-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-brand-gold" />
                <h2 className="text-base font-bold text-slate-100">Modify Team Member</h2>
              </div>
              <button
                onClick={() => setEditingAdmin(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-mono mb-1">MEMBER NAME</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-brand-gold/60"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-mono mb-1">EMAIL ADDRESS</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-brand-gold/60"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-mono mb-1">ASSIGNED ROLE</label>
                  <select
                    value={editRole}
                    onChange={e => setEditRole(e.target.value as AdminRole)}
                    className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-brand-gold/60"
                  >
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="EDITOR">EDITOR</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-mono mb-1">ACCESS STATUS</label>
                  <select
                    value={editStatus ? 'true' : 'false'}
                    onChange={e => setEditStatus(e.target.value === 'true')}
                    className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-brand-gold/60"
                  >
                    <option value="true">Active (Allowed)</option>
                    <option value="false">Suspended (Blocked)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-mono mb-1">
                  NEW PASSWORD <span className="text-slate-500 font-normal">(Leave blank to keep current)</span>
                </label>
                <div className="relative">
                  <Key className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    value={editPassword}
                    onChange={e => setEditPassword(e.target.value)}
                    placeholder="Min 10 chars (uppercase, lowercase, number)"
                    className="w-full pl-9 pr-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-gold/60"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingAdmin(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-lg bg-brand-gold hover:bg-brand-goldHover text-dark-900 font-bold transition disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ATTENDANCE & ACTIVITY TRACKER */}
      {activityAdmin && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-2xl bg-dark-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-brand-gold" />
                  <span>Attendance & Activity Telemetry</span>
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  {activityAdmin.name} ({activityAdmin.email})
                </p>
              </div>
              <button
                onClick={() => setActivityAdmin(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {activityLoading ? (
              <div className="py-16 text-center text-slate-400 font-mono text-xs">
                <div className="w-5 h-5 border-2 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <span>Querying attendance telemetry & audit logs...</span>
              </div>
            ) : activityData ? (
              <div className="space-y-4 overflow-y-auto pr-1 text-xs">
                {/* Status Header Cards */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/80">
                    <div className="text-[10px] text-slate-400 font-mono uppercase">Live Presence</div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        activityData.presence === 'ONLINE' ? 'bg-emerald-400 animate-pulse' :
                        activityData.presence === 'IDLE' ? 'bg-amber-400' : 'bg-slate-500'
                      }`} />
                      <span className="font-bold text-slate-100 font-mono">{activityData.presence}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/80">
                    <div className="text-[10px] text-slate-400 font-mono uppercase">Total Sessions</div>
                    <div className="mt-1 font-bold text-slate-100 font-mono text-sm">
                      {activityData.totalLogins} Logins
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/80">
                    <div className="text-[10px] text-slate-400 font-mono uppercase">Last Active</div>
                    <div className="mt-1 text-slate-200 font-mono text-[11px]">
                      {activityData.lastActive ? new Date(activityData.lastActive).toLocaleString() : 'No recent activity'}
                    </div>
                  </div>
                </div>

                {/* Audit Trail List */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider">
                    Recent Action History ({(activityData?.recentLogs || []).length} events)
                  </div>

                  <div className="glass-panel rounded-xl border border-slate-800 overflow-hidden max-h-64 overflow-y-auto">
                    {(activityData?.recentLogs || []).length === 0 ? (
                      <div className="p-6 text-center text-slate-500 font-mono">
                        No recorded action history for this account yet.
                      </div>
                    ) : (
                      <table className="w-full text-left text-[11px] text-slate-300 font-mono">
                        <thead className="bg-slate-900/90 text-slate-400 uppercase text-[9px] border-b border-slate-800">
                          <tr>
                            <th className="px-4 py-2">Timestamp</th>
                            <th className="px-4 py-2">Action</th>
                            <th className="px-4 py-2">Target</th>
                            <th className="px-4 py-2">IP Origin</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {activityData.recentLogs.map(log => (
                            <tr key={log.id} className="hover:bg-slate-800/40">
                              <td className="px-4 py-2 text-slate-500">
                                {new Date(log.createdAt).toLocaleTimeString()} · {new Date(log.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-2 font-bold text-slate-200">
                                {log.action}
                              </td>
                              <td className="px-4 py-2 text-brand-gold">
                                {log.resourceType}
                              </td>
                              <td className="px-4 py-2 text-slate-400">
                                {log.ipAddress || '127.0.0.1'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => setActivityAdmin(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-medium"
              >
                Close Telemetry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: DELETE MEMBER CONFIRMATION */}
      {deletingAdmin && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-dark-900 border border-red-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-100">Revoke Access?</h3>
              <p className="text-xs text-slate-400">
                Are you sure you want to delete administrator <span className="text-slate-200 font-semibold">{deletingAdmin.name}</span>? This action cannot be undone.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingAdmin(null)}
                className="w-1/2 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteMember}
                disabled={actionLoading}
                className="w-1/2 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/20"
              >
                {actionLoading ? 'Revoking...' : 'Confirm Revoke'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
