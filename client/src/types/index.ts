export type Role = 'ADMIN' | 'PM' | 'DEVELOPER';
export type ProjectStatus = 'ACTIVE' | 'COMPLETED' | 'ON_HOLD';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type NotificationType = 'TASK_ASSIGNED' | 'TASK_IN_REVIEW' | 'STATUS_CHANGE';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  company: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  clientId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  client: Client;
  createdBy: { id: string; name: string; email: string };
  _count?: { tasks: number };
}

export interface Task {
  id: string;
  taskNumber: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  isOverdue: boolean;
  dueDate?: string;
  projectId: string;
  assignedToId?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: { id: string; name: string; email: string };
  createdBy?: { id: string; name: string };
  project?: { id: string; name: string; createdById: string };
}

export interface ActivityLog {
  id: string;
  userId: string;
  projectId: string;
  taskId?: string;
  action: string;
  details?: Record<string, unknown>;
  createdAt: string;
  user?: { id: string; name: string };
  project?: { id: string; name: string };
  task?: { id: string; title: string; taskNumber: number };
}

export interface Notification {
  id: string;
  userId: string;
  actorId: string;
  taskId?: string;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: string;
  actor?: { id: string; name: string };
  task?: { id: string; title: string; taskNumber: number };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: unknown };
  pagination?: { page: number; limit: number; total: number; totalPages: number };
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}
