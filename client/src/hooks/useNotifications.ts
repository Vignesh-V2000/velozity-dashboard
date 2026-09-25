import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { ENDPOINTS } from '../api/endpoints';
import { Notification } from '../types';
import { useSocket } from '../socket/useSocket';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { socket } = useSocket();

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get(ENDPOINTS.NOTIFICATIONS);
      setNotifications(data.data?.notifications ?? []);
      setUnreadCount(data.data?.unreadCount ?? 0);
    } catch { /* ignore */ } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  // Real-time notifications
  useEffect(() => {
    if (!socket) return;
    const handler = (notif: Notification) => {
      setNotifications((prev) => [notif, ...prev]);
      setUnreadCount((c) => c + 1);
    };
    socket.on('notification:new', handler);
    return () => { socket.off('notification:new', handler); };
  }, [socket]);

  const markAsRead = useCallback(async (id: string) => {
    await api.patch(ENDPOINTS.NOTIFICATION_READ(id));
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    setUnreadCount((c) => Math.max(0, c - 1));
  }, []);

  const markAllAsRead = useCallback(async () => {
    await api.patch(ENDPOINTS.NOTIFICATIONS_READ_ALL);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  return { notifications, unreadCount, isLoading, markAsRead, markAllAsRead, refetch: fetchNotifications };
}
