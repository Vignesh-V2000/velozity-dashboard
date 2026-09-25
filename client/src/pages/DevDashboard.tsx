import React, { useState } from 'react';
import { Layout } from '../components/Layout/Layout';
import { useProjects } from '../hooks/useProjects';
import { useTasks } from '../hooks/useTasks';
import { TaskCard } from '../components/Tasks/TaskCard';
import { ActivityFeed } from '../components/ActivityFeed/ActivityFeed';
import { updateTaskStatus } from '../hooks/useTasks';
import { LoadingCenter } from '../components/ui/Spinner';
import { TaskModal } from '../components/Tasks/TaskModal';
import { Task } from '../types';

// For developer, we need tasks across all their projects
function AllDevTasks() {
  const { projects } = useProjects();
  const [selected, setSelected] = useState<Task | null>(null);
  const [, forceUpdate] = useState(0);

  if (projects.length === 0) return <LoadingCenter />;

  return (
    <>
      {projects.map((p) => (
        <ProjectTaskSection key={p.id} projectId={p.id} projectName={p.name} onRefresh={() => forceUpdate((n) => n + 1)} />
      ))}
      {selected && (
        <TaskModal
          projectId={selected.projectId}
          task={selected}
          canEdit={false}
          onClose={() => setSelected(null)}
          onSaved={() => {}}
        />
      )}
    </>
  );
}

function ProjectTaskSection({ projectId, projectName, onRefresh }: { projectId: string; projectName: string; onRefresh: () => void }) {
  const { tasks, isLoading, refetch } = useTasks(projectId);
  const [selected, setSelected] = useState<Task | null>(null);

  const handleStatusChange = async (taskId: string, status: string) => {
    await updateTaskStatus(taskId, status);
    refetch();
    onRefresh();
  };

  if (isLoading) return null;
  if (!tasks.length) return null;

  return (
    <div style={{ marginBottom: 20 }}>
      <div className="section-title">{projectName}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {tasks
          .sort((a, b) => {
            const pOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
            return (pOrder[a.priority] ?? 3) - (pOrder[b.priority] ?? 3);
          })
          .map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => setSelected(task)}
              onStatusChange={(s) => handleStatusChange(task.id, s)}
              showStatusButtons
            />
          ))}
      </div>
      {selected && (
        <TaskModal
          projectId={projectId}
          task={selected}
          canEdit={false}
          onClose={() => setSelected(null)}
          onSaved={refetch}
        />
      )}
    </div>
  );
}

export function DevDashboard() {

  return (
    <Layout title="My Tasks">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
        <div>
          <div className="card">
            <div className="card-header">
              <h2>My Assigned Tasks</h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sorted by priority</span>
            </div>
            <AllDevTasks />
          </div>
        </div>
        <div className="card" style={{ height: 'fit-content' }}>
          <div className="card-header" style={{ marginBottom: 12 }}>
            <h2>Activity</h2>
            <span className="pill"><span className="online-dot" />Live</span>
          </div>
          <ActivityFeed maxHeight={500} />
        </div>
      </div>
    </Layout>
  );
}
