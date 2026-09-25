import React from 'react';
import { useActivityFeed } from '../../hooks/useActivityFeed';
import { ActivityItem } from './ActivityItem';
import { LoadingCenter } from '../ui/Spinner';

interface ActivityFeedProps {
  projectId?: string;
  maxHeight?: number;
}

export function ActivityFeed({ projectId, maxHeight = 400 }: ActivityFeedProps) {
  const { activities, isLoading } = useActivityFeed(projectId);

  if (isLoading) return <LoadingCenter />;

  if (!activities.length) {
    return <div className="empty-state">No activity yet.</div>;
  }

  return (
    <div className="activity-feed" style={{ maxHeight, overflowY: 'auto' }}>
      {activities.map((a) => (
        <ActivityItem key={a.id} activity={a} />
      ))}
    </div>
  );
}
