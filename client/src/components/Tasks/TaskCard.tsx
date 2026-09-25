import React from 'react';
import { Task } from '../../types';
import { StatusBadge, PriorityBadge } from '../ui/Badge';
import { formatDate } from '../../utils/formatters';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  onStatusChange?: (status: string) => void;
  showStatusButtons?: boolean;
}

const NEXT_STATUS: Record<string, string[]> = {
  TODO: ['IN_PROGRESS'],
  IN_PROGRESS: ['IN_REVIEW', 'TODO'],
  IN_REVIEW: ['DONE', 'IN_PROGRESS'],
  DONE: [],
};

export function TaskCard({ task, onClick, onStatusChange, showStatusButtons = false }: TaskCardProps) {
  return (
    <div className={`task-card${task.isOverdue ? ' task-card-overdue' : ''}`} onClick={onClick}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>
            #{task.taskNumber}
          </div>
          <div className="task-title">{task.title}</div>
        </div>
        <PriorityBadge priority={task.priority} />
      </div>

      <div className="task-meta">
        <StatusBadge status={task.status} />
        {task.dueDate && (
          <span style={{ fontSize: '0.7rem', color: task.isOverdue ? '#f87171' : 'var(--text-muted)' }}>
            {task.isOverdue ? '⚠ ' : '📅 '}{formatDate(task.dueDate)}
          </span>
        )}
        {task.assignedTo && (
          <span className="task-assignee">👤 {task.assignedTo.name}</span>
        )}
      </div>

      {showStatusButtons && onStatusChange && NEXT_STATUS[task.status]?.length > 0 && (
        <div style={{ display: 'flex', gap: 6, marginTop: 10 }} onClick={(e) => e.stopPropagation()}>
          {NEXT_STATUS[task.status].map((s) => (
            <button
              key={s}
              className="btn btn-ghost btn-sm"
              onClick={() => onStatusChange(s)}
            >
              → {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
