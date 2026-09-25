import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout/Layout';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { LoadingCenter } from '../components/ui/Spinner';
import { Input, Select } from '../components/ui/Input';
import api from '../api/axios';
import { ENDPOINTS } from '../api/endpoints';
import { User, Role } from '../types';
import { ROLE_LABELS } from '../utils/constants';
import { formatDate } from '../utils/formatters';

function UserFormModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('DEVELOPER');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const roleOpts = [
    { value: 'ADMIN', label: 'Admin' },
    { value: 'PM', label: 'Project Manager' },
    { value: 'DEVELOPER', label: 'Developer' },
  ];

  const handleSave = async () => {
    if (!name || !email || !password) { setError('All fields required'); return; }
    setSaving(true);
    try {
      await api.post(ENDPOINTS.USERS, { name, email, password, role });
      onSaved();
      onClose();
    } catch (e: any) {
      setError(e.response?.data?.error?.message ?? 'Failed to create user');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Create User" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {error && <div className="login-error">{error}</div>}
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" id="user-name-input" />
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@velozity.com" id="user-email-input" />
        <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters" id="user-password-input" />
        <Select label="Role" options={roleOpts} value={role} onChange={(e) => setRole(e.target.value as Role)} id="user-role-select" />
      </div>
      <div className="modal-actions">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} loading={saving} id="user-save-btn">Create User</Button>
      </div>
    </Modal>
  );
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchUsers = () => {
    api.get(ENDPOINTS.USERS).then(({ data }) => setUsers(data.data ?? [])).finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  if (loading) return <Layout title="User Management"><LoadingCenter /></Layout>;

  return (
    <Layout title="User Management">
      <div className="card">
        <div className="card-header">
          <div>
            <h2>Team Members</h2>
            <div className="text-sm text-muted mt-1">{users.length} total users</div>
          </div>
          <Button id="create-user-btn" size="sm" onClick={() => setShowForm(true)}>+ New User</Button>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-light)', flexShrink: 0 }}>
                        {u.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      {u.name}
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td><span className={`role-badge role-${u.role}`}>{ROLE_LABELS[u.role]}</span></td>
                  <td style={{ color: 'var(--text-muted)' }}>{formatDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && <UserFormModal onClose={() => setShowForm(false)} onSaved={fetchUsers} />}
    </Layout>
  );
}
