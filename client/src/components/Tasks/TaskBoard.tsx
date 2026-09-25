import React, { useState } from 'react';
import { Task, User } from '../../types';
import { TaskCard } from './TaskCard';
import { TaskModal } from './TaskModal';
import { updateTaskStatus } from '../../hooks/useTasks';

interface TaskBoardProps {
  tasks: Task[];
  projectId: string;
  developers?: Pick<User, 'id' | 'name'>[];
  canEdit: boolean;
  canUpdateStatus?: boolean;
  onRefresh: () => void;
}

const COLUMNS = [
  { key: 'TODO', label: 'To Do' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'IN_REVIEW', label: 'In Review' },
  { key: 'DONE', label: 'Done' },
];

export function TaskBoard({ tasks, projectId, developers = [], canEdit, canUpdateStatus = false, onRefresh }: TaskBoardProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleStatusChange = async (taskId: string, status: string) => {
    try {
      await updateTaskStatus(taskId, status);
      onRefresh();
    } catch (e) {
      console.error('Status update failed:', e);
    }
  };

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.key);
          return (
            <div key={col.key}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {col.label}
                </span>
                <span style={{ background: 'var(--bg-hover)', borderRadius: 10, padding: '1px 7px', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  {colTasks.length}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {colTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onClick={() => setSelectedTask(task)}
                    onStatusChange={(s) => handleStatusChange(task.id, s)}
                    showStatusButtons={canUpdateStatus}
                  />
                ))}
                {colTasks.length === 0 && (
                  <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', border: '1px dashed var(--border)', borderRadius: 'var(--radius)' }}>
                    Empty
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedTask && (
        <TaskModal
          projectId={projectId}
          task={selectedTask}
          developers={developers}
          canEdit={canEdit}
          onClose={() => setSelectedTask(null)}
          onSaved={onRefresh}
        />
      )}
    </>
  );
}
