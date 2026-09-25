# Velozity Global Solutions — Real-Time Client Project Dashboard

A full-stack web application for agency project management with role-based access, real-time activity feeds, and live notifications.

---

## Tech Stack

| Layer | Technology | Justification |
|---|---|---|
| **Frontend** | React 18 + TypeScript + Vite | Fast DX, type safety, required by assessment |
| **Backend** | Node.js + Express + TypeScript | Largest ecosystem, best Socket.io integration |
| **Database** | PostgreSQL + Prisma ORM | Relational integrity for roles/projects/tasks; Prisma provides type-safe queries and migrations |
| **WebSockets** | Socket.io | Built-in room/namespace support for role-filtered feeds, automatic reconnection, heartbeat presence |
| **Background Jobs** | Bull Queue (Redis) | Persistent job queue that survives restarts; supports retries, delayed jobs, and cron scheduling |
| **Auth** | JWT (access) + HttpOnly cookie (refresh) | Access token in memory prevents XSS on refresh token; short-lived access tokens limit exposure |

---

## Architecture Decisions

### Why Bull Queue instead of node-cron?
- Bull persists jobs in Redis, so they survive server restarts
- Supports job retries with exponential backoff
- Provides visibility into scheduled, active, and failed jobs
- node-cron runs in process memory and loses jobs on restart

### Why Socket.io rooms for the activity feed?
- Each project has a room (`project:${projectId}`)
- Admins join a `global-feed` room and receive all events
- PMs only receive events from their projects
- Developers only receive events for projects with their tasks
- This avoids broadcasting everything to every client

### Why access token in memory (not localStorage)?
- localStorage is accessible by any JS on the page (XSS risk)
- Memory storage means the token is lost on page refresh, but the HttpOnly refresh cookie restores it automatically
- HttpOnly cookies cannot be read by JavaScript, protecting the refresh token from XSS

### Why Prisma over raw SQL?
- Type-safe queries with TypeScript autocompletion
- Schema-as-code with migration history
- Prevents SQL injection by default

---

## Database Schema

```
User ──< RefreshToken
User ──< Project (createdBy)
User ──< Task (assignedTo, createdBy)
User ──< ActivityLog
User ──< Notification (recipient, actor)
Client ──< Project
Project ──< Task
Project ──< ActivityLog
Task ──< ActivityLog
Task ──< Notification
```

### Key Indexes

| Index | Reason |
|---|---|
| `User.email` | Login lookups |
| `User.role` | Admin user management filter |
| `RefreshToken.token` | Token lookup during refresh (O(1)) |
| `Project.createdById` | PM dashboard "my projects" queries |
| `Task.assignedToId` | Developer dashboard "my tasks" queries |
| `Task.status`, `Task.priority` | Task filter queries |
| `Task.dueDate` | Overdue job: `WHERE dueDate < NOW() AND status != DONE` |
| `Task.isOverdue` | Dashboard overdue count widget |
| `ActivityLog.createdAt DESC` | Feed ordered by recency |
| `Notification(userId, read)` | Unread badge count |

---

## Project Structure

```
d:\chc\Assasment\
├── docker-compose.yml         # Postgres + Redis + server + client
├── .env.example
├── server/                    # Express API
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema + migrations
│   │   └── seed.ts            # Test data
│   └── src/
│       ├── config/            # Env validation, Prisma, Redis
│       ├── middleware/        # auth, roleGuard, validate, errorHandler
│       ├── routes/            # Express routers
│       ├── controllers/       # Request handlers
│       ├── services/          # Business logic
│       ├── socket/            # Socket.io server setup + handlers
│       ├── jobs/              # Bull queue + overdue task job
│       ├── validators/        # Zod schemas for every endpoint
│       └── utils/             # JWT, bcrypt, errors, logger
└── client/                    # React frontend
    └── src/
        ├── api/               # Axios instance + endpoint constants
        ├── auth/              # AuthContext, AuthProvider, ProtectedRoute
        ├── socket/            # Socket.io client context
        ├── hooks/             # useProjects, useTasks, useNotifications, etc.
        ├── components/        # Layout, ActivityFeed, Notifications, Tasks, Projects, UI
        └── pages/             # Login, AdminDashboard, PMDashboard, DevDashboard, etc.
```

---

## Role-Based Access

| Feature | Admin | PM | Developer |
|---|---|---|---|
| View all projects | ✅ | ✅ (own) | ✅ (with tasks) |
| Create/edit projects | ✅ | ✅ (own) | ✗ |
| Delete projects | ✅ | ✗ | ✗ |
| Create tasks | ✅ | ✅ (own project) | ✗ |
| Update task status | ✅ | ✅ | ✅ (assigned only) |
| Global activity feed | ✅ | ✗ | ✗ |
| Manage users | ✅ | ✗ | ✗ |
| Online user count | ✅ | ✗ | ✗ |

---

## Real-Time Events

| Event | Emitted by | Received by |
|---|---|---|
| `activity:new` | Server (on status change) | Project room members + admin global-feed |
| `notification:new` | Server (on task assigned/in-review) | `user:${recipientId}` room |
| `presence:update` | Server (on connect/disconnect) | All connected clients |
| `activity:catchup` | Client (on reconnect) | Server responds with missed events |

---

## Local Setup

### With Docker (Recommended)

```bash
# Copy env files
cp .env.example .env
cp server/.env.example server/.env

# Start all services
docker-compose up -d

# Run migrations and seed
docker exec velozity_server npm run db:migrate
docker exec velozity_server npm run db:seed

# Open the app
open http://localhost:5173
```

### Without Docker (Manual)

**Prerequisites**: Node.js 18+, PostgreSQL 15, Redis 7

```bash
# Install server dependencies
cd server
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev

# Install client dependencies (separate terminal)
cd client
npm install
npm run dev
```

---

## Test Credentials (all passwords: `Password123!`)

| Role | Email |
|---|---|
| **Admin** | admin@velozity.com |
| **PM 1** | pm1@velozity.com |
| **PM 2** | pm2@velozity.com |
| **Dev 1** | dev1@velozity.com |
| **Dev 2** | dev2@velozity.com |
| **Dev 3** | dev3@velozity.com |
| **Dev 4** | dev4@velozity.com |

---

## API Reference

### Auth
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | ✗ | Login — returns access token + sets refresh cookie |
| POST | `/api/auth/refresh` | Cookie | Rotate refresh token |
| POST | `/api/auth/logout` | ✓ | Revoke refresh token |
| GET | `/api/auth/me` | ✓ | Get current user |

### Projects
| Method | Path | Roles |
|---|---|---|
| GET | `/api/projects` | All (role-filtered) |
| POST | `/api/projects` | Admin, PM |
| PUT | `/api/projects/:id` | Admin, PM (owner) |
| DELETE | `/api/projects/:id` | Admin |

### Tasks
| Method | Path | Roles |
|---|---|---|
| GET | `/api/projects/:pid/tasks` | All (role-filtered) |
| POST | `/api/projects/:pid/tasks` | Admin, PM |
| PUT | `/api/tasks/:id` | Admin, PM (owner) |
| PATCH | `/api/tasks/:id/status` | All (dev: assigned only) |

### Notifications
| Method | Path |
|---|---|
| GET | `/api/notifications` |
| PATCH | `/api/notifications/:id/read` |
| PATCH | `/api/notifications/read-all` |

---

## Background Jobs

The overdue task checker runs every 5 minutes via Bull Queue:

```sql
UPDATE Task SET isOverdue = true
WHERE dueDate < NOW() AND status != 'DONE' AND isOverdue = false
```

Jobs are persisted in Redis and survive server restarts. Failed jobs are retried 3 times with exponential backoff.

---

## Security Notes

- Passwords hashed with bcrypt (12 rounds)
- Refresh tokens stored in HttpOnly, SameSite=lax cookies
- Refresh token rotation on every use (old revoked, new issued)
- All endpoints protected by JWT middleware
- Role enforcement at service layer (not just route level)
- Environment variables validated with Zod on startup
- Error messages never expose stack traces in production
