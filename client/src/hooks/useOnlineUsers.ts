import { useState, useEffect } from 'react';
import { useSocket } from '../socket/useSocket';

export function useOnlineUsers() {
  const [count, setCount] = useState<number>(0);
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;
    const handler = ({ count: c }: { count: number }) => setCount(c);
    socket.on('presence:update', handler);
    return () => { socket.off('presence:update', handler); };
  }, [socket]);

  return { count };
}
