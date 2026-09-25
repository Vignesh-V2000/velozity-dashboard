import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import { Role } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex-center" style={{ height: '100vh' }}>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to their own dashboard
    const dashMap: Record<string, string> = { ADMIN: '/admin', PM: '/pm', DEVELOPER: '/dev' };
    return <Navigate to={dashMap[user.role] ?? '/'} replace />;
  }

  return <>{children}</>;
}
