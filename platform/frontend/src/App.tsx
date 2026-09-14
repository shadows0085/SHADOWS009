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

export const App: React.FC = () => {
  return (
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
  );
};
