import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import { SocketProvider } from './socket/SocketContext';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { useAuth } from './auth/useAuth';

import { Login } from './pages/Login';
import { AdminDashboard } from './pages/AdminDashboard';
import { PMDashboard } from './pages/PMDashboard';
import { DevDashboard } from './pages/DevDashboard';
import { ProjectDetail } from './pages/ProjectDetail';
import { UserManagement } from './pages/UserManagement';
import { ProjectsPage } from './pages/ProjectsPage';
import { NotFound } from './pages/NotFound';

function RoleRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  const map: Record<string, string> = { ADMIN: '/admin', PM: '/pm', DEVELOPER: '/dev' };
  return <Navigate to={map[user.role] ?? '/login'} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/projects" element={<ProtectedRoute allowedRoles={['ADMIN']}><ProjectsPage /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['ADMIN']}><UserManagement /></ProtectedRoute>} />

      {/* PM */}
      <Route path="/pm" element={<ProtectedRoute allowedRoles={['PM']}><PMDashboard /></ProtectedRoute>} />
      <Route path="/pm/projects" element={<ProtectedRoute allowedRoles={['PM']}><ProjectsPage /></ProtectedRoute>} />

      {/* Developer */}
      <Route path="/dev" element={<ProtectedRoute allowedRoles={['DEVELOPER']}><DevDashboard /></ProtectedRoute>} />

      {/* Shared */}
      <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />

      {/* Root redirect */}
      <Route path="/" element={<ProtectedRoute><RoleRedirect /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <AppRoutes />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
