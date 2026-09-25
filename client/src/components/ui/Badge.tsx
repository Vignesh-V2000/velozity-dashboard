import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: string;
  className?: string;
}

export function Badge({ children, variant, className = '' }: BadgeProps) {
  return (
    <span className={`badge ${variant ? `badge-${variant.toLowerCase().replace('_', '')}` : ''} ${className}`}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const label: Record<string, string> = {
    TODO: 'To Do',
    IN_PROGRESS: 'In Progress',
    IN_REVIEW: 'In Review',
    DONE: 'Done',
  };
  const cls: Record<string, string> = {
    TODO: 'todo',
    IN_PROGRESS: 'inprogress',
    IN_REVIEW: 'inreview',
    DONE: 'done',
  };
  return <span className={`badge badge-${cls[status] ?? 'todo'}`}>{label[status] ?? status}</span>;
}

export function PriorityBadge({ priority }: { priority: string }) {
  return (
    <span className={`badge badge-${priority.toLowerCase()}`}>{priority}</span>
  );
}
