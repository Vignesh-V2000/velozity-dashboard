import React from 'react';
import { ActivityLog } from '../../types';
import { formatActivityMessage, timeAgo, getInitials } from '../../utils/formatters';

export function ActivityItem({ activity }: { activity: ActivityLog }) {
  const initials = getInitials(activity.user?.name ?? '?');
  const message = formatActivityMessage(activity);
  return (
    <div className="activity-item">
      <div className="activity-avatar">{initials}</div>
      <div className="activity-body">
        <div className="activity-text">{message}</div>
        <div className="activity-time">{timeAgo(activity.createdAt)}</div>
      </div>
    </div>
  );
}
