import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input, Select } from '../ui/Input';
import { Button } from '../ui/Button';
import { createProject, updateProject } from '../../hooks/useProjects';
import { Project } from '../../types';
import api from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';

interface ProjectFormProps {
  project?: Project | null;
  onClose: () => void;
  onSaved: () => void;
}

export function ProjectForm({ project, onClose, onSaved }: ProjectFormProps) {
  const [name, setName] = useState(project?.name ?? '');
  const [description, setDescription] = useState(project?.description ?? '');
  const [status, setStatus] = useState(project?.status ?? 'ACTIVE');
  const [clientId, setClientId] = useState(project?.clientId ?? '');
  const [clients, setClients] = useState<{ id: string; company: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/clients').then(({ data }) => setClients(data.data ?? [])).catch(() => {});
  }, []);

  const statusOpts = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'ON_HOLD', label: 'On Hold' },
  ];

  const clientOpts = [
    { value: '', label: 'Select client…' },
    ...clients.map((c) => ({ value: c.id, label: c.company })),
  ];

  const handleSave = async () => {
    if (!name.trim()) { setError('Name is required'); return; }
    if (!clientId) { setError('Client is required'); return; }
    setSaving(true);
    setError('');
    try {
      const body = { name: name.trim(), description: description.trim() || undefined, status, clientId };
      if (project) {
        await updateProject(project.id, body);
      } else {
        await createProject(body);
      }
      onSaved();
      onClose();
    } catch (e: any) {
      setError(e.response?.data?.error?.message ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={project ? 'Edit Project' : 'Create Project'} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {error && <div className="login-error">{error}</div>}
        <Input label="Project Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Acme E-Commerce Redesign" id="project-name-input" />
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="input" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional…" />
        </div>
        <Select label="Client" options={clientOpts} value={clientId} onChange={(e) => setClientId(e.target.value)} id="project-client-select" />
        <Select label="Status" options={statusOpts} value={status} onChange={(e) => setStatus(e.target.value)} id="project-status-select" />
      </div>
      <div className="modal-actions">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} loading={saving} id="project-save-btn">{project ? 'Save' : 'Create'}</Button>
      </div>
    </Modal>
  );
}
