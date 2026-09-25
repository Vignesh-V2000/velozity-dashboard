import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

export function NotFound() {
  const { user } = useAuth();
  const home = user?.role === 'ADMIN' ? '/admin' : user?.role === 'PM' ? '/pm' : '/dev';
  return (
    <div className="flex-center" style={{ height: '100vh', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: '4rem', fontWeight: 700, color: 'var(--accent-light)' }}>404</div>
      <h1 style={{ color: 'var(--text-secondary)' }}>Page not found</h1>
      <Link to={home} className="btn btn-primary">Go to Dashboard</Link>
    </div>
  );
}
