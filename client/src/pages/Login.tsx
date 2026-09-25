import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      // Let App.tsx redirect based on role
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.error?.message ?? 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (role: string) => {
    const creds: Record<string, [string, string]> = {
      admin: ['admin@velozity.com', 'Password123!'],
      pm: ['pm1@velozity.com', 'Password123!'],
      dev: ['dev1@velozity.com', 'Password123!'],
    };
    const [e, p] = creds[role];
    setEmail(e);
    setPassword(p);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <h1>Velozity</h1>
          <p>Real-Time Project Dashboard</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="login-error" role="alert">{error}</div>}
          <Input
            id="login-email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@velozity.com"
            autoComplete="email"
            required
          />
          <Input
            id="login-password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
          <Button id="login-submit" type="submit" loading={loading} style={{ width: '100%', justifyContent: 'center' }}>
            Sign In
          </Button>
        </form>

        <div style={{ marginTop: 24, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8 }}>Quick login (demo):</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button id="quick-admin" className="btn btn-ghost btn-sm" type="button" onClick={() => quickLogin('admin')} style={{ flex: 1 }}>Admin</button>
            <button id="quick-pm" className="btn btn-ghost btn-sm" type="button" onClick={() => quickLogin('pm')} style={{ flex: 1 }}>PM</button>
            <button id="quick-dev" className="btn btn-ghost btn-sm" type="button" onClick={() => quickLogin('dev')} style={{ flex: 1 }}>Dev</button>
          </div>
        </div>
      </div>
    </div>
  );
}
