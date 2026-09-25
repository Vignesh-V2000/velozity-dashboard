import React from 'react';
import { Project } from '../../types';
import { ProjectCard } from './ProjectCard';
import { LoadingCenter } from '../ui/Spinner';

interface ProjectListProps {
  projects: Project[];
  isLoading: boolean;
  error?: string | null;
}

export function ProjectList({ projects, isLoading, error }: ProjectListProps) {
  if (isLoading) return <LoadingCenter />;
  if (error) return <div className="login-error">{error}</div>;
  if (!projects.length) return <div className="empty-state">No projects found.</div>;

  return (
    <div className="grid-2">
      {projects.map((p) => <ProjectCard key={p.id} project={p} />)}
    </div>
  );
}
