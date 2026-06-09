# Kanban Project Management System (PMS)

## Project Vision

Build a production-grade Project Management System inspired by:

* Linear
* Jira
* ClickUp
* Monday

The objective is to demonstrate:

* Backend Engineering
* Software Architecture
* Database Design
* API Design
* Frontend Engineering
* Scalability
* Clean Code Practices
* Future AI Integration

The system should be suitable for real-world usage while remaining maintainable and extensible.

---

# Core Product Principles

## 1. Modular Monolith

Chosen Architecture:

```text
Router
↓
Service
↓
Repository
↓
PostgreSQL
```

Reasoning:

* Easier deployment
* Easier debugging
* Simpler transactions
* Faster development
* Lower operational complexity
* Easier future extraction into services if needed

---

## 2. Backend First

Development order:

```text
Database Schema
↓
API Contracts
↓
Backend Modules
↓
Frontend Integration
```

Reasoning:

The frontend should consume stable APIs instead of forcing backend redesigns.

---

## 3. Scope Discipline

Every feature must answer:

"Does this help teams manage projects better?"

Features that do not directly improve project management are deferred to later releases.

---

# Technology Stack

## Frontend

* Next.js
* TypeScript
* Tailwind CSS
* shadcn/ui
* TanStack Query
* dnd-kit
* Zustand (minimal state)

Typography:

* Satoshi (Primary)
* Inter (Fallback)

---

## Backend

* Python 3.13+
* FastAPI
* SQLAlchemy 2.x
* Pydantic v2
* Alembic

---

## Database

* PostgreSQL

---

## Future Infrastructure

* Redis
* Docker
* pgvector
* OpenAI
* Anthropic

---

# Authentication Strategy

Supported Methods:

## Email & Password

Users can register and login using:

* Full Name
* Username
* Email
* Password

---

## OAuth 2.0

Providers:

* Google
* GitHub

OAuth users still receive local accounts.

---

## Session Strategy

Use:

* Access Token (JWT)
* Refresh Token (JWT)

Pattern:

```text
Login
↓
Access Token (15 min)

Refresh Token (7-30 days)
```

Storage:

* Access Token → Memory
* Refresh Token → HttpOnly Cookie

Reasoning:

Industry-standard architecture.

---

# Frontend Design System

## Design Direction

Inspired by:

* Linear
* Raycast
* Notion
* Modern SaaS dashboards

Characteristics:

* Clean
* Minimal
* Fast
* Information-dense
* Professional

---

## Theme Support

### Dark Theme

Primary theme.

### Light Theme

Fully supported.

Both themes use design tokens instead of hardcoded colors.

Example:

```css
--background
--foreground
--card
--border
```

Reasoning:

Allows future themes with minimal effort.

---

# Domain Architecture

Hierarchy:

```text
Workspace
│
├── Projects
│
├── Boards
│
├── Columns
│
└── Tasks
```

Example:

```text
Razim Workspace
└── PMS Project
    └── Development Board
        ├── Todo
        ├── In Progress
        ├── Review
        └── Done
```

---

# Database Design

## Users

Stores:

* Email
* Username
* Full Name
* Password
* OAuth Information
* Avatar
* Account State

---

## Workspaces

Top-level organizational unit.

Contains:

* Members
* Projects

---

## Workspace Members

Role-based membership.

Roles:

* OWNER
* ADMIN
* MEMBER

---

## Projects

Workspace-level projects.

Supports:

* Archive
* Delete
* Ownership tracking

---

## Boards

Project-level boards.

---

## Columns

Dynamic workflow columns.

Examples:

* Todo
* In Progress
* Review
* Done

Not hardcoded.

Reason:

Future support for custom workflows.

---

## Tasks

Core work unit.

Supports:

* Assignment
* Due Dates
* Priority
* Status
* Ordering

---

## Task Comments

Task-level discussions.

---

## Mentions

Supports:

```text
@username
```

Creates notifications.

---

## Notifications

User-specific events.

Examples:

* Task Assigned
* Mentioned
* Due Soon
* Overdue
* Project Invitation

---

## Activity Logs

System audit trail.

Examples:

* Task Created
* Task Updated
* Task Deleted
* Task Moved

---

# V1 Release

Goal:

Allow teams to manage projects effectively.

## Authentication

* Email Registration
* Email Login
* Google OAuth
* GitHub OAuth
* JWT Access Tokens
* JWT Refresh Tokens
* Logout
* Current User Endpoint

---

## User Management

* Profile
* Avatar URL
* Account Settings

---

## Workspaces

* Create Workspace
* Update Workspace
* Delete Workspace
* Invite Members

Roles:

* Owner
* Admin
* Member

---

## Projects

* Create
* Update
* Archive
* Delete

---

## Boards

* Create
* Update
* Delete

---

## Columns

* Create
* Rename
* Delete
* Reorder

---

## Tasks

* Create
* Update
* Delete
* Assign
* Due Dates
* Priority
* Move Between Columns

---

## Comments

* Create
* Edit
* Delete

---

## Mentions

* @username support

---

## Notifications

* Assignment Notifications
* Mention Notifications
* Due Soon Notifications
* Overdue Notifications

---

## Activity Logs

System-wide activity tracking.

---

# V1.5 Release

Goal:

Improve productivity and collaboration.

## Labels

Examples:

* Bug
* Frontend
* Backend
* Design
* Urgent

---

## Filters

Filter by:

* Assignee
* Priority
* Status
* Due Date

---

## Search

Search:

* Tasks
* Projects
* Users

Database-powered search.

No AI.

---

## Watchers

Users can follow tasks.

Receive updates automatically.

---

## Saved Views

Examples:

* My Tasks
* Due This Week
* Overdue

---

## Attachments

Support:

* Images
* PDFs
* Documents

Storage:

* Cloudinary
  or
* S3

Decision pending.

---

## Markdown Support

Rich task descriptions.

---

## Checklists

Nested task checklist items.

---

## Project Templates

Examples:

* Software Project
* Marketing Campaign
* Design Sprint

---

## Personal Archetype System

Visible only to the user.

Not part of collaboration.

Purpose:

Provide personalized insights based on work habits.

Examples:

* Owl
* Falcon
* Wolf
* Dolphin
* Ant

Generated from user activity patterns.

Does not affect permissions, rankings, or workflows.

---

# V2 Release

Goal:

Real-time collaboration and scalability.

---

## Redis

Used for:

* Caching
* Pub/Sub
* Background Processing

---

## WebSockets

Real-time:

* Notifications
* Board Updates
* Task Updates

---

## Presence

Examples:

```text
John is online
```

---

## Typing Indicators

Examples:

```text
John is typing...
```

---

## Enhanced Notification Delivery

Potential channels:

* In-App
* Email
* Push Notifications

---

# V2.5 Release

Goal:

Reporting and analytics.

---

## Analytics Dashboard

Metrics:

* Tasks Created
* Tasks Completed
* Completion Rate
* Velocity

---

## Team Performance

Metrics:

* Assigned Tasks
* Completed Tasks
* Overdue Tasks

---

## Burndown Charts

Preparation for future sprint support.

---

# V3 Release

Goal:

AI-Powered Project Management.

---

## AI Task Generation

Generate subtasks from natural language goals.

---

## Sprint Summaries

AI-generated weekly summaries.

---

## Risk Analysis

Detect:

* Overdue work
* Blocked tasks
* Resource bottlenecks

---

## Smart Suggestions

Examples:

* Reassign task
* Move task
* Adjust deadlines

---

## Semantic Search

Using:

* pgvector

Allows natural language search.

---

# Features Explicitly Excluded From V1

The following are intentionally deferred:

* Direct Messaging
* WebSockets
* Redis
* AI Features
* Analytics
* Reporting
* Sprints
* Calendar Views
* Leaderboards
* Gamification
* Achievement Systems
* Animal Aliases for Collaboration

Reason:

Maintain focus on core project management workflows.
