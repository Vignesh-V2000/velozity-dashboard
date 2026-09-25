import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { ENDPOINTS } from '../api/endpoints';
import { Task } from '../types';

export function useTasks(projectId: string, filters: Record<string, string> = {}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
      const { data } = await api.get(`${ENDPOINTS.PROJECT_TASKS(projectId)}?${params}`);
      setTasks(data.data ?? []);
    } catch (e: any) {
      setError(e.response?.data?.error?.message ?? 'Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  }, [projectId, JSON.stringify(filters)]);

  useEffect(() => { if (projectId) fetchTasks(); }, [fetchTasks, projectId]);

  return { tasks, isLoading, error, refetch: fetchTasks, setTasks };
}

export async function createTask(projectId: string, body: Record<string, unknown>) {
  const { data } = await api.post(ENDPOINTS.PROJECT_TASKS(projectId), body);
  return data.data as Task;
}

export async function updateTaskStatus(taskId: string, status: string) {
  const { data } = await api.patch(ENDPOINTS.TASK_STATUS(taskId), { status });
  return data.data as Task;
}

export async function updateTask(taskId: string, body: Record<string, unknown>) {
  const { data } = await api.put(ENDPOINTS.TASK(taskId), body);
  return data.data as Task;
}
