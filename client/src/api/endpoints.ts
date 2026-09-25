export const ENDPOINTS = {
  // Auth
  AUTH_LOGIN:   '/auth/login',
  AUTH_REFRESH: '/auth/refresh',
  AUTH_LOGOUT:  '/auth/logout',
  AUTH_ME:      '/auth/me',

  // Users
  USERS:             '/users',
  USERS_DEVELOPERS:  '/users/developers',
  USERS_ONLINE:      '/users/online-count',

  // Projects
  PROJECTS:          '/projects',
  PROJECT:           (id: string) => `/projects/${id}`,
  PROJECT_STATS:     '/projects/stats',

  // Tasks
  PROJECT_TASKS:     (pid: string) => `/projects/${pid}/tasks`,
  TASK:              (id: string) => `/tasks/${id}`,
  TASK_STATUS:       (id: string) => `/tasks/${id}/status`,

  // Activity
  ACTIVITIES:        '/activities',
  PROJECT_ACTIVITIES:(pid: string) => `/projects/${pid}/activities`,

  // Notifications
  NOTIFICATIONS:           '/notifications',
  NOTIFICATION_READ:       (id: string) => `/notifications/${id}/read`,
  NOTIFICATIONS_READ_ALL:  '/notifications/read-all',
} as const;
