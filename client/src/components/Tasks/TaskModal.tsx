import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input, Select } from '../ui/Input';
import { Button } from '../ui/Button';
import { Task, User } from '../../types';
import { createTask, updateTask } from '../../hooks/useTasks';
import { formatDate } from '../../utils/formatters';
import { StatusBadge, PriorityBadge } from '../ui/Badge';

interface TaskModalProps {
  projectId: string;
  task?: Task | null;
  developers?: Pick<User, 'id' | 'name'>[];
  canEdit: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function TaskModal({ projectId, task, developers = [], canEdit, onClose, onSaved }: TaskModalProps) {
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [priority, setPriority] = useState(task?.priority ?? 'MEDIUM');
  const [dueDate, setDueDate] = useState(task?.dueDate ? task.dueDate.slice(0, 10) : '');
  const [assignedToId, setAssignedToId] = useState(task?.assignedToId ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isView = !canEdit && !!task;

  const handleSave = async () => {
    if (!title.trim()) { setError('Title is required'); return; }
    setSaving(true);
    setError('');
    try {
      const body = {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        assignedToId: assignedToId || undefined,
      };
      if (task) {
        await updateTask(task.id, body);
      } else {
        await createTask(projectId, body);
      }
      onSaved();
      onClose();
    } catch (e: any) {
      setError(e.response?.data?.error?.message ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const priorityOpts = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'CRITICAL', label: 'Critical' },
  ];

  const devOpts = [
    { value: '', label: 'Unassigned' },
    ...developers.map((d) => ({ value: d.id, label: d.name })),
  ];

  if (isView && task) {
    return (
      <Modal title={`Task #${task.taskNumber}`} onClose={onClose}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h3>{task.title}</h3>
          {task.description && <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{task.description}</p>}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
            {task.isOverdue && <span className="badge" style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171' }}>OVERDUE</span>}
          </div>
          {task.dueDate && <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Due: {formatDate(task.dueDate)}</div>}
          {task.assignedTo && <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Assigned to: {task.assignedTo.name}</div>}
        </div>
        <div className="modal-actions">
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title={task ? 'Edit Task' : 'Create Task'} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {error && <div className="login-error">{error}</div>}
        <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" id="task-title-input" />
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="input" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description…" />
        </div>
        <Select label="Priority" options={priorityOpts} value={priority} onChange={(e) => setPriority(e.target.value)} id="task-priority-select" />
        <Input label="Due Date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} id="task-duedate-input" />
        {developers.length > 0 && (
          <Select label="Assign To" options={devOpts} value={assignedToId} onChange={(e) => setAssignedToId(e.target.value)} id="task-assignee-select" />
        )}
      </div>
      <div className="modal-actions">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} loading={saving} id="task-save-btn">{task ? 'Save' : 'Create'}</Button>
      </div>
    </Modal>
  );
}
