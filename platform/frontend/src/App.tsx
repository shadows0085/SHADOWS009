import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminLayout } from './layouts/AdminLayout';
import { LoginPage } from './pages/Login';
import { DashboardPage } from './pages/Dashboard';
import { VideosPage } from './pages/Videos';
import { UploadPage } from './pages/Upload';
import { AuditLogsPage } from './pages/AuditLogs';
import { SecuritySettingsPage } from './pages/SecuritySettings';
import { AdminManagementPage } from './pages/AdminManagement';
import { PortfolioCMSPage } from './pages/PortfolioCMS';
import { CodeEditorPage } from './pages/CodeEditor';
import { SiteControllerPage } from './pages/SiteController';

const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRole?: string }> = ({
  children,
  requiredRole
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center text-brand-gold font-mono text-xs">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
          <span>INITIALIZING SECURE SESSION...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== 'SUPER_ADMIN' && user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class GlobalErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[Admin Console Fault]:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center p-6 text-slate-100 font-sans">
          <div className="max-w-md w-full glass-panel p-8 rounded-2xl border border-red-500/30 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 mx-auto rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <span className="text-xl">⚠️</span>
            </div>
            <h2 className="text-lg font-bold text-slate-100">Console Session Exception</h2>
            <p className="text-xs text-slate-400 font-mono">
              {this.state.error?.message || 'A render exception occurred in the dashboard view.'}
            </p>
            <div className="pt-2 flex gap-3 justify-center">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="px-4 py-2 rounded-lg bg-brand-gold text-dark-900 text-xs font-bold hover:bg-brand-goldHover transition"
              >
                Reload Console
              </button>
              <button
                onClick={() => {
                  sessionStorage.clear();
                  window.location.href = '/admin/login';
                }}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-200 text-xs font-medium hover:bg-slate-700 transition"
              >
                Reset Session
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export const App: React.FC = () => {
  return (
    <GlobalErrorBoundary>
      <AuthProvider>
        <BrowserRouter basename="/admin">
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="portfolio" element={<PortfolioCMSPage />} />
              <Route path="editor" element={<CodeEditorPage />} />
              <Route path="site-control" element={<SiteControllerPage />} />
              <Route path="videos" element={<VideosPage />} />
              <Route path="upload" element={<UploadPage />} />
              <Route path="audit-logs" element={<AuditLogsPage />} />
              <Route path="security" element={<SecuritySettingsPage />} />
              <Route
                path="admins"
                element={
                  <ProtectedRoute requiredRole="SUPER_ADMIN">
                    <AdminManagementPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </GlobalErrorBoundary>
  );
};
