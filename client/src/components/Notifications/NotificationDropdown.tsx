import React from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import { timeAgo } from '../../utils/formatters';

export function NotificationDropdown({ onClose: _onClose }: { onClose: () => void }) {
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotifications();

  return (
    <div className="notif-dropdown">
      <div className="notif-dropdown-header">
        <h3 style={{ fontSize: '0.875rem' }}>Notifications</h3>
        {unreadCount > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={markAllAsRead}>
            Mark all read
          </button>
        )}
      </div>
      <div className="notif-list">
        {notifications.length === 0 ? (
          <div className="empty-state">No notifications</div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`notif-item${!n.read ? ' unread' : ''}`}
              onClick={() => { if (!n.read) markAsRead(n.id); }}
            >
              <div className="notif-message">{n.message}</div>
              <div className="notif-time">{timeAgo(n.createdAt)}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
