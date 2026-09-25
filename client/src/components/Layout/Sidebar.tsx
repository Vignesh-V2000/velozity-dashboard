import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';

interface NavItem {
  to: string;
  label: string;
  icon: string;
}

const ADMIN_NAV: NavItem[] = [
  { to: '/admin', label: 'Dashboard', icon: '⬛' },
  { to: '/admin/projects', label: 'Projects', icon: '📁' },
  { to: '/admin/users', label: 'Users', icon: '👥' },
];

const PM_NAV: NavItem[] = [
  { to: '/pm', label: 'Dashboard', icon: '⬛' },
  { to: '/pm/projects', label: 'My Projects', icon: '📁' },
];

const DEV_NAV: NavItem[] = [
  { to: '/dev', label: 'My Tasks', icon: '✅' },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const nav = user?.role === 'ADMIN' ? ADMIN_NAV : user?.role === 'PM' ? PM_NAV : DEV_NAV;

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-text">Velozity</div>
        <div className="logo-sub">Project Dashboard</div>
      </div>

      <nav className="sidebar-nav">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to.split('/').length === 2}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {user && (
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{user.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <span className={`role-badge role-${user.role}`}>{user.role}</span>
            </div>
          </div>
        )}
        <button onClick={handleLogout} className="nav-item" style={{ color: '#f87171', width: '100%' }}>
          <span className="nav-icon">↩</span>
          Logout
        </button>
      </div>
    </aside>
  );
}
