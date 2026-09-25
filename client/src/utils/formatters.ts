export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatActivityMessage(activity: {
  action: string;
  user?: { name: string };
  task?: { taskNumber: number; title: string };
  details?: Record<string, unknown>;
  project?: { name: string };
}): string {
  const who = activity.user?.name ?? 'Someone';
  const task = activity.task ? `Task #${activity.task.taskNumber}` : 'a task';
  const details = activity.details as any;

  switch (activity.action) {
    case 'STATUS_CHANGE':
      return `${who} moved ${task} from ${details?.from} → ${details?.to}`;
    case 'TASK_CREATED':
      return `${who} created ${task}: ${details?.taskTitle ?? ''}`;
    case 'TASK_ASSIGNED':
      return `${who} assigned ${task} to ${details?.assigneeName ?? 'a developer'}`;
    case 'PROJECT_CREATED':
      return `${who} created project "${details?.projectName ?? activity.project?.name ?? ''}"`;
    default:
      return `${who} performed ${activity.action} on ${task}`;
  }
}

export function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

export function getDueDateStatus(dueDate?: string): 'overdue' | 'soon' | 'ok' | 'none' {
  if (!dueDate) return 'none';
  const now = Date.now();
  const due = new Date(dueDate).getTime();
  const diff = due - now;
  if (diff < 0) return 'overdue';
  if (diff < 3 * 24 * 60 * 60 * 1000) return 'soon';
  return 'ok';
}
