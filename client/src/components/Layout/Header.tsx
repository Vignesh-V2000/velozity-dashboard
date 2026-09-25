import React from 'react';
import { useSocketContext } from '../../socket/SocketContext';
import { NotificationBell } from '../Notifications/NotificationBell';

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const { isConnected } = useSocketContext();

  return (
    <header className="topbar">
      <span className="topbar-title">{title}</span>
      <div className="topbar-actions">
        <span className="pill">
          <span className="online-dot" style={{ background: isConnected ? '#4ade80' : '#f87171' }} />
          {isConnected ? 'Live' : 'Offline'}
        </span>
        <NotificationBell />
      </div>
    </header>
  );
}
