import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '../components/Layout/Layout';
import { TaskBoard } from '../components/Tasks/TaskBoard';
import { TaskFilters } from '../components/Tasks/TaskFilters';
import { TaskModal } from '../components/Tasks/TaskModal';
import { ActivityFeed } from '../components/ActivityFeed/ActivityFeed';
import { Button } from '../components/ui/Button';
import { LoadingCenter } from '../components/ui/Spinner';
import { useTasks } from '../hooks/useTasks';
import { useFilters } from '../hooks/useFilters';
import { useAuth } from '../auth/useAuth';
import api from '../api/axios';
import { ENDPOINTS } from '../api/endpoints';
import { Project, User } from '../types';
import { PROJECT_STATUS_LABELS } from '../utils/constants';

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toQueryObject } = useFilters();
  const filters = toQueryObject();

  const { tasks, isLoading: tasksLoading, refetch } = useTasks(id!, filters);
  const [project, setProject] = useState<Project | null>(null);
  const [developers, setDevelopers] = useState<Pick<User, 'id' | 'name'>[]>([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const canEdit = user?.role === 'ADMIN' || user?.role === 'PM';
  const canUpdateStatus = user?.role === 'DEVELOPER' || canEdit;

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.get(ENDPOINTS.PROJECT(id)),
      canEdit ? api.get(ENDPOINTS.USERS_DEVELOPERS) : Promise.resolve({ data: { data: [] } }),
    ])
      .then(([pRes, dRes]) => {
        setProject(pRes.data.data);
        setDevelopers(dRes.data.data);
      })
      .finally(() => setLoading(false));
  }, [id, canEdit]);

  if (loading) return <LoadingCenter />;
  if (!project) return <div className="empty-state">Project not found.</div>;

  const STATUS_COLORS: Record<string, string> = {
    ACTIVE: '#4ade80',
    COMPLETED: 'var(--accent-light)',
    ON_HOLD: '#fbbf24',
  };

  return (
    <Layout title={project.name}>
      {/* Project Header */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h1 style={{ marginBottom: 6 }}>{project.name}</h1>
            {project.description && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 10 }}>{project.description}</p>
            )}
            <div style={{ display: 'flex', gap: 16, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span>📁 {project.client.company}</span>
              <span>👤 {project.createdBy.name}</span>
              <span style={{ color: STATUS_COLORS[project.status] }}>● {PROJECT_STATUS_LABELS[project.status]}</span>
            </div>
          </div>
          {canEdit && (
            <Button id="project-add-task-btn" size="sm" onClick={() => setShowTaskForm(true)}>+ Add Task</Button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
        {/* Task Board */}
        <div>
          <div className="flex-between" style={{ marginBottom: 12 }}>
            <h2>Tasks</h2>
            <TaskFilters />
          </div>
          {tasksLoading ? (
            <LoadingCenter />
          ) : (
            <TaskBoard
              tasks={tasks}
              projectId={id!}
              developers={developers}
              canEdit={canEdit}
              canUpdateStatus={canUpdateStatus}
              onRefresh={refetch}
            />
          )}
        </div>

        {/* Activity Feed Sidebar */}
        <div className="card" style={{ height: 'fit-content', position: 'sticky', top: 0 }}>
          <div className="card-header" style={{ marginBottom: 12 }}>
            <h3>Activity</h3>
            <span className="pill"><span className="online-dot" />Live</span>
          </div>
          <ActivityFeed projectId={id} maxHeight={600} />
        </div>
      </div>

      {showTaskForm && (
        <TaskModal
          projectId={id!}
          developers={developers}
          canEdit={canEdit}
          onClose={() => setShowTaskForm(false)}
          onSaved={refetch}
        />
      )}
    </Layout>
  );
}
