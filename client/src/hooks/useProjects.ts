import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { ENDPOINTS } from '../api/endpoints';
import { Project } from '../types';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.get(ENDPOINTS.PROJECTS);
      setProjects(data.data ?? []);
    } catch (e: any) {
      setError(e.response?.data?.error?.message ?? 'Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { projects, isLoading, error, refetch: fetch };
}

export async function createProject(body: Record<string, unknown>) {
  const { data } = await api.post(ENDPOINTS.PROJECTS, body);
  return data.data as Project;
}

export async function updateProject(id: string, body: Record<string, unknown>) {
  const { data } = await api.put(ENDPOINTS.PROJECT(id), body);
  return data.data as Project;
}

export async function deleteProject(id: string) {
  await api.delete(ENDPOINTS.PROJECT(id));
}
