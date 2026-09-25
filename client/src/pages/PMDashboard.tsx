import React, { useState } from 'react';
import { Layout } from '../components/Layout/Layout';
import { ProjectList } from '../components/Projects/ProjectList';
import { ProjectForm } from '../components/Projects/ProjectForm';
import { ActivityFeed } from '../components/ActivityFeed/ActivityFeed';
import { useProjects } from '../hooks/useProjects';
import { Button } from '../components/ui/Button';

export function PMDashboard() {
  const { projects, isLoading, error, refetch } = useProjects();
  const [showForm, setShowForm] = useState(false);

  const tasksByPriority = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  const overdueTasks = 0; // would need a separate fetch

  return (
    <Layout title="PM Dashboard">
      {/* Summary */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-label">My Projects</div>
          <div className="stat-value stat-accent">{projects.length}</div>
          <div className="stat-sub">Owned by you</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active</div>
          <div className="stat-value stat-success">{projects.filter((p) => p.status === 'ACTIVE').length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">On Hold</div>
          <div className="stat-value stat-warning">{projects.filter((p) => p.status === 'ON_HOLD').length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Completed</div>
          <div className="stat-value stat-accent">{projects.filter((p) => p.status === 'COMPLETED').length}</div>
        </div>
      </div>

      {/* Projects */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <h2>My Projects</h2>
          <Button id="pm-create-project-btn" size="sm" onClick={() => setShowForm(true)}>+ New Project</Button>
        </div>
        <ProjectList projects={projects} isLoading={isLoading} error={error} />
      </div>

      {/* Activity Feed */}
      <div className="card">
        <div className="card-header">
          <h2>Activity Feed</h2>
          <span className="pill"><span className="online-dot" />Real-time</span>
        </div>
        <ActivityFeed maxHeight={400} />
      </div>

      {showForm && (
        <ProjectForm onClose={() => setShowForm(false)} onSaved={refetch} />
      )}
    </Layout>
  );
}
