import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { ENDPOINTS } from '../api/endpoints';
import { ActivityLog } from '../types';
import { useSocket } from '../socket/useSocket';

export function useActivityFeed(projectId?: string) {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { socket } = useSocket();

  const fetchActivities = useCallback(async () => {
    setIsLoading(true);
    try {
      const url = projectId
        ? ENDPOINTS.PROJECT_ACTIVITIES(projectId)
        : ENDPOINTS.ACTIVITIES;
      const { data } = await api.get(url);
      setActivities(data.data ?? []);
      if (data.data?.length) {
        localStorage.setItem('lastActivitySeen', data.data[0].createdAt);
      }
    } catch { /* ignore */ } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => { fetchActivities(); }, [fetchActivities]);

  // Request catchup of missed events after socket reconnects
  useEffect(() => {
    if (!socket) return;
    const since = localStorage.getItem('lastActivitySeen') ?? undefined;
    socket.emit('activity:catchup', { since, projectId });

    socket.on('activity:catchup:response', (items: ActivityLog[]) => {
      if (items.length) setActivities((prev) => [...items.filter(i => !prev.find(p => p.id === i.id)), ...prev]);
    });

    return () => { socket.off('activity:catchup:response'); };
  }, [socket, projectId]);

  // Real-time new activity
  useEffect(() => {
    if (!socket) return;
    const handler = (activity: ActivityLog) => {
      setActivities((prev) => {
        if (prev.find((a) => a.id === activity.id)) return prev;
        localStorage.setItem('lastActivitySeen', activity.createdAt);
        return [activity, ...prev];
      });
    };
    socket.on('activity:new', handler);
    return () => { socket.off('activity:new', handler); };
  }, [socket]);

  // Join/leave project room
  useEffect(() => {
    if (!socket || !projectId) return;
    socket.emit('project:join', projectId);
    return () => { socket.emit('project:leave', projectId); };
  }, [socket, projectId]);

  return { activities, isLoading, refetch: fetchActivities };
}
