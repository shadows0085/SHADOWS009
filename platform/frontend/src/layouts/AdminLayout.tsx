import React from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Film,
  UploadCloud,
  FileText,
  ShieldCheck,
  Users,
  LogOut,
  Shield,
  Search,
  Sparkles,
  Code2,
  Eye,
  Bell
} from 'lucide-react';

interface TabBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class TabErrorBoundary extends React.Component<{ children: React.ReactNode }, TabBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): TabBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[Admin Tab Exception]:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center p-12 text-slate-100 font-sans">
          <div className="max-w-md w-full glass-panel p-8 rounded-2xl border border-amber-500/30 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 mx-auto rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <span className="text-xl">⚠️</span>
            </div>
            <h2 className="text-base font-bold text-slate-100">Module View Interrupted</h2>
            <p className="text-xs text-slate-400 font-mono">
              {this.state.error?.message || 'A data sync exception occurred in this module.'}
            </p>
            <div className="pt-2">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="px-4 py-2 rounded-lg bg-brand-gold text-dark-900 text-xs font-bold hover:bg-brand-goldHover transition"
              >
                Reload Module
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export const AdminLayout: React.FC = () => {
  const { user, logout, hasPermission } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = React.useState('');
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [isNotifOpen, setIsNotifOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState([
    { id: 1, title: 'AES-256 Vault Active', desc: 'Hardware cryptographic rotation and ticket system operational.', time: 'Just now', unread: true },
    { id: 2, title: 'SOC Stream Tickets', desc: 'Secure short-lived HMAC tickets are circulating normally.', time: '5m ago', unread: false },
    { id: 3, title: 'Upload Pipeline Ready', desc: 'Resumable chunked upload worker initialized.', time: '1h ago', unread: false }
  ]);

  const navItems = [
    { label: 'Dashboard & SOC', path: '/dashboard', icon: LayoutDashboard, perm: 'analytics:read' },
    { label: 'Portfolio CMS', path: '/portfolio', icon: Sparkles, perm: 'video:read' },
    { label: 'Core File Editor', path: '/editor', icon: Code2, perm: 'security:manage' },
    { label: 'Live Site Controller', path: '/site-control', icon: Eye, perm: 'analytics:read' },
    { label: 'Video Vault', path: '/videos', icon: Film, perm: 'video:read' },
    { label: 'Upload Asset', path: '/upload', icon: UploadCloud, perm: 'video:create' },
    { label: 'Audit Logs', path: '/audit-logs', icon: FileText, perm: 'audit:read' },
    { label: 'Team & Roles', path: '/admins', icon: Users, perm: 'admin:read' },
    { label: 'Security Center', path: '/security', icon: ShieldCheck, perm: 'security:manage' }
  ];

  const filteredNav = (navItems || []).filter(item => {
    if (!searchQuery.trim()) return false;
    return item.label.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const unreadCount = (notifications || []).filter(n => n?.unread).length;

  const markAllNotifsRead = () => {
    setNotifications(prev => (prev || []).map(n => ({ ...n, unread: false })));
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-dark-900 text-slate-100 overflow-hidden font-sans">
      {/* SIDEBAR */}
      <aside className="w-64 flex flex-col border-r border-slate-800/80 bg-dark-800/60 backdrop-blur-xl z-20">
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800/80">
          <div className="w-8 h-8 rounded-lg bg-brand-gold/20 border border-brand-gold/40 flex items-center justify-center text-brand-gold shadow-[0_0_15px_rgba(201,168,76,0.3)]">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold tracking-wider text-sm text-slate-100">SHADOW</span>
            <span className="block text-[10px] text-brand-gold tracking-widest font-mono">SECURE VAULT</span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map(item => {
            if (item.perm && !hasPermission(item.perm) && user?.role !== 'SUPER_ADMIN') {
              return null;
            }

            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-brand-gold/15 text-brand-gold border border-brand-gold/30 shadow-[0_0_10px_rgba(201,168,76,0.1)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card */}
        <div className="p-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/40 border border-slate-800">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center font-bold text-xs text-brand-gold uppercase">
                {user?.name ? user.name[0] : 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-200 truncate">{user?.name || 'Admin'}</p>
                <p className="text-[10px] text-brand-gold font-mono truncate">{user?.role || 'EDITOR'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout Session"
              className="p-2 rounded-lg text-slate-400 hover:text-brand-danger hover:bg-red-500/10 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-800/80 bg-dark-800/40 backdrop-blur-md px-8 flex items-center justify-between z-10 relative">
          <div className="flex items-center gap-3 w-96 relative">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
                placeholder="Search modules, sections, vault..."
                className="w-full pl-9 pr-4 py-1.5 bg-slate-900/80 border border-slate-700/60 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-gold/50 transition"
              />
            </div>

            {/* Quick search dropdown */}
            {isSearchOpen && searchQuery.trim() && (
              <div className="absolute top-11 left-0 w-full bg-dark-800 border border-slate-700 rounded-xl shadow-2xl p-2 z-50">
                <div className="text-[10px] font-mono text-slate-400 px-2 py-1 uppercase tracking-wider">Navigation Results</div>
                {filteredNav.length > 0 ? (
                  filteredNav.map(item => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.path}
                        onMouseDown={() => {
                          navigate(item.path);
                          setSearchQuery('');
                          setIsSearchOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs text-slate-200 hover:bg-brand-gold/15 hover:text-brand-gold transition"
                      >
                        <Icon className="w-3.5 h-3.5 text-brand-gold" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })
                ) : (
                  <div className="px-3 py-2 text-xs text-slate-400">No matching admin modules found</div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <a
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-brand-gold text-xs font-medium border border-brand-gold/20 transition"
              title="Open live portfolio website"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Live Portfolio</span>
            </a>

            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>AES-256 VAULT ACTIVE</span>
            </div>

            {/* Notification Bell with interactive popover */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition relative"
                title="System Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-gold animate-ping"></span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-dark-800 border border-slate-700 rounded-xl shadow-2xl p-3 z-50 space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
                    <span className="text-xs font-semibold text-slate-200">System Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotifsRead}
                        className="text-[10px] text-brand-gold hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {notifications.map(n => (
                      <div
                        key={n.id}
                        className={`p-2 rounded-lg text-xs border ${
                          n.unread
                            ? 'bg-slate-800/80 border-brand-gold/30 text-slate-200'
                            : 'bg-dark-900/40 border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-between font-medium mb-1">
                          <span className={n.unread ? 'text-brand-gold' : 'text-slate-300'}>{n.title}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{n.time}</span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-slate-400">{n.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Outlet */}
        <main className="flex-1 overflow-y-auto p-8">
          <TabErrorBoundary key={location.pathname}>
            <Outlet />
          </TabErrorBoundary>
        </main>
      </div>
    </div>
  );
};
