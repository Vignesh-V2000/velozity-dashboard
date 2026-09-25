export const API_BASE = import.meta.env.VITE_API_URL ?? '';

export const STATUS_LABELS: Record<string, string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  IN_REVIEW: 'In Review',
  DONE: 'Done',
};

export const PRIORITY_LABELS: Record<string, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

export const PROJECT_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
  ON_HOLD: 'On Hold',
};

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin',
  PM: 'Project Manager',
  DEVELOPER: 'Developer',
};
