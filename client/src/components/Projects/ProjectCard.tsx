import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Project } from '../../types';
import { PROJECT_STATUS_LABELS } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';

interface ProjectCardProps {
  project: Project;
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: '#4ade80',
  COMPLETED: 'var(--accent-light)',
  ON_HOLD: '#fbbf24',
};

export function ProjectCard({ project }: ProjectCardProps) {
  const navigate = useNavigate();

  return (
    <div className="card" style={{ cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
      onClick={() => navigate(`/projects/${project.id}`)}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
        <h3 style={{ fontSize: '0.9375rem' }}>{project.name}</h3>
        <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: `${STATUS_COLORS[project.status]}22`, color: STATUS_COLORS[project.status], whiteSpace: 'nowrap', flexShrink: 0 }}>
          {PROJECT_STATUS_LABELS[project.status]}
        </span>
      </div>
      {project.description && (
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {project.description}
        </p>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <span>📁 {project.client.company}</span>
        <span>{project._count?.tasks ?? 0} tasks</span>
      </div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 6 }}>
        PM: {project.createdBy.name} · Created {formatDate(project.createdAt)}
      </div>
    </div>
  );
}
