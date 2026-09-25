import React, { useState } from 'react';
import { Layout } from '../components/Layout/Layout';
import { ProjectList } from '../components/Projects/ProjectList';
import { ProjectForm } from '../components/Projects/ProjectForm';
import { useProjects } from '../hooks/useProjects';
import { Button } from '../components/ui/Button';
import { useAuth } from '../auth/useAuth';

export function ProjectsPage() {
  const { projects, isLoading, error, refetch } = useProjects();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);

  const canCreate = user?.role === 'ADMIN' || user?.role === 'PM';

  return (
    <Layout title="Projects">
      <div className="card">
        <div className="card-header">
          <div>
            <h2>All Projects</h2>
            <div className="text-sm text-muted mt-1">{projects.length} projects</div>
          </div>
          {canCreate && (
            <Button id="projects-create-btn" size="sm" onClick={() => setShowForm(true)}>+ New Project</Button>
          )}
        </div>
        <ProjectList projects={projects} isLoading={isLoading} error={error} />
      </div>

      {showForm && (
        <ProjectForm onClose={() => setShowForm(false)} onSaved={refetch} />
      )}
    </Layout>
  );
}
