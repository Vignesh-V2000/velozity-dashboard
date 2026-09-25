import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout/Layout';
import { ActivityFeed } from '../components/ActivityFeed/ActivityFeed';
import { useOnlineUsers } from '../hooks/useOnlineUsers';
import api from '../api/axios';
import { ENDPOINTS } from '../api/endpoints';

interface Stats {
  total: number;
  byStatus: { status: string; _count: number }[];
  overdueTasks: number;
}

export function AdminDashboard() {
  const { count: onlineCount } = useOnlineUsers();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.get(ENDPOINTS.PROJECT_STATS).then(({ data }) => setStats(data.data)).catch(() => {});
  }, []);

  const getStatusCount = (s: string) => stats?.byStatus.find((b) => b.status === s)?._count ?? 0;

  return (
    <Layout title="Admin Dashboard">
      {/* Stat Cards */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-label">Total Projects</div>
          <div className="stat-value stat-accent">{stats?.total ?? '—'}</div>
          <div className="stat-sub">All clients</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Projects</div>
          <div className="stat-value stat-success">{getStatusCount('ACTIVE')}</div>
          <div className="stat-sub">Currently running</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Overdue Tasks</div>
          <div className="stat-value stat-danger">{stats?.overdueTasks ?? '—'}</div>
          <div className="stat-sub">Needs attention</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Online Now</div>
          <div className="stat-value stat-accent">{onlineCount}</div>
          <div className="stat-sub">
            <span className="online-dot" style={{ display: 'inline-block', marginRight: 4 }} />
            Live
          </div>
        </div>
      </div>

      {/* Project Status Breakdown */}
      {stats && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <h2>Project Status</h2>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            {[
              { s: 'ACTIVE', label: 'Active', color: '#4ade80' },
              { s: 'ON_HOLD', label: 'On Hold', color: '#fbbf24' },
              { s: 'COMPLETED', label: 'Completed', color: 'var(--accent-light)' },
            ].map(({ s, label, color }) => {
              const count = getStatusCount(s);
              const pct = stats.total ? Math.round((count / stats.total) * 100) : 0;
              return (
                <div key={s} style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{label}</span>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{count}</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--bg-hover)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Global Activity Feed */}
      <div className="card">
        <div className="card-header">
          <h2>Live Activity Feed</h2>
          <span className="pill"><span className="online-dot" />Real-time</span>
        </div>
        <ActivityFeed maxHeight={500} />
      </div>
    </Layout>
  );
}
