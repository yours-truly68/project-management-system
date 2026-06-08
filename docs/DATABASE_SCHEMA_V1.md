# DATABASE_SCHEMA_V1.md

## Purpose

This document defines the canonical V1 database schema for the Project Management System.

This document is the source of truth for:

* SQLAlchemy Models
* Alembic Migrations
* Repository Layer
* API Contracts
* Future Feature Expansion

No schema changes should be made without updating this document.

---

# Database

PostgreSQL

Primary Key Strategy:

* UUID v7
* Generated in application layer
* Using uuid6 package

Example:

```python
from uuid6 import uuid7
```

All entities use UUID v7.

---

# Enums

## AuthProvider

```python
EMAIL
GOOGLE
GITHUB
```

---

## WorkspaceRole

```python
OWNER
ADMIN
MEMBER
```

---

## Priority

```python
LOW
MEDIUM
HIGH
URGENT
```

---

## NotificationType

```python
TASK_ASSIGNED
TASK_MENTIONED
TASK_DUE_SOON
TASK_OVERDUE
PROJECT_INVITATION
COMMENT_ADDED
```

---

## ActivityType

```python
TASK_CREATED
TASK_UPDATED
TASK_DELETED
TASK_MOVED

PROJECT_CREATED
PROJECT_UPDATED
PROJECT_ARCHIVED

COMMENT_CREATED
```

---

# users

Represents authenticated users.

## Columns

| Column          | Type         | Constraints        |
| --------------- | ------------ | ------------------ |
| id              | UUID         | PK                 |
| email           | VARCHAR(255) | UNIQUE NOT NULL    |
| username        | VARCHAR(50)  | UNIQUE NOT NULL    |
| full_name       | VARCHAR(100) | NOT NULL           |
| hashed_password | VARCHAR(255) | NULLABLE FOR OAUTH |
| auth_provider   | ENUM         | NOT NULL           |
| provider_id     | VARCHAR(255) | NULLABLE           |
| avatar_url      | TEXT         | NULLABLE           |
| is_active       | BOOLEAN      | DEFAULT TRUE       |
| is_verified     | BOOLEAN      | DEFAULT FALSE      |
| created_at      | TIMESTAMPTZ  | NOT NULL           |
| updated_at      | TIMESTAMPTZ  | NOT NULL           |

## Indexes

```sql
UNIQUE(email)

UNIQUE(username)

INDEX(email)

INDEX(username)
```

---

# workspaces

Top-level organizational unit.

## Columns

| Column     | Type             |
| ---------- | ---------------- |
| id         | UUID             |
| name       | VARCHAR(100)     |
| slug       | VARCHAR(100)     |
| owner_id   | UUID FK users.id |
| created_at | TIMESTAMPTZ      |
| updated_at | TIMESTAMPTZ      |

## Constraints

```sql
UNIQUE(slug)
```

## Indexes

```sql
INDEX(owner_id)
```

---

# workspace_members

Workspace membership table.

## Columns

| Column       | Type                  |
| ------------ | --------------------- |
| id           | UUID                  |
| workspace_id | UUID FK workspaces.id |
| user_id      | UUID FK users.id      |
| role         | ENUM WorkspaceRole    |
| created_at   | TIMESTAMPTZ           |

## Constraints

```sql
UNIQUE(workspace_id, user_id)
```

## Indexes

```sql
INDEX(workspace_id)

INDEX(user_id)
```

---

# projects

Workspace projects.

## Columns

| Column       | Type                  |
| ------------ | --------------------- |
| id           | UUID                  |
| workspace_id | UUID FK workspaces.id |
| name         | VARCHAR(150)          |
| description  | TEXT                  |
| created_by   | UUID FK users.id      |
| is_archived  | BOOLEAN               |
| created_at   | TIMESTAMPTZ           |
| updated_at   | TIMESTAMPTZ           |

## Indexes

```sql
INDEX(workspace_id)

INDEX(created_by)
```

---

# boards

Project boards.

## Columns

| Column     | Type                |
| ---------- | ------------------- |
| id         | UUID                |
| project_id | UUID FK projects.id |
| name       | VARCHAR(100)        |
| created_at | TIMESTAMPTZ         |
| updated_at | TIMESTAMPTZ         |

## Indexes

```sql
INDEX(project_id)
```

---

# columns

Kanban workflow columns.

Examples:

* Todo
* In Progress
* Review
* Done

Columns are dynamic and not hardcoded.

## Columns

| Column     | Type              |
| ---------- | ----------------- |
| id         | UUID              |
| board_id   | UUID FK boards.id |
| name       | VARCHAR(100)      |
| position   | INTEGER           |
| color      | VARCHAR(20)       |
| created_at | TIMESTAMPTZ       |
| updated_at | TIMESTAMPTZ       |

## Constraints

```sql
UNIQUE(board_id, position)
```

## Indexes

```sql
INDEX(board_id)
```

---

# tasks

Core work entity.

## Columns

| Column      | Type               |
| ----------- | ------------------ |
| id          | UUID               |
| board_id    | UUID FK boards.id  |
| column_id   | UUID FK columns.id |
| title       | VARCHAR(255)       |
| description | TEXT               |
| priority    | ENUM Priority      |
| position    | INTEGER            |
| assignee_id | UUID FK users.id   |
| created_by  | UUID FK users.id   |
| due_date    | TIMESTAMPTZ        |
| created_at  | TIMESTAMPTZ        |
| updated_at  | TIMESTAMPTZ        |

## Constraints

```sql
UNIQUE(column_id, position)
```

## Indexes

```sql
INDEX(board_id)

INDEX(column_id)

INDEX(assignee_id)

INDEX(created_by)

INDEX(due_date)
```

Purpose:

Position powers drag-and-drop ordering.

---

# task_comments

Task discussion thread.

## Columns

| Column     | Type             |
| ---------- | ---------------- |
| id         | UUID             |
| task_id    | UUID FK tasks.id |
| user_id    | UUID FK users.id |
| content    | TEXT             |
| created_at | TIMESTAMPTZ      |
| updated_at | TIMESTAMPTZ      |

## Indexes

```sql
INDEX(task_id)

INDEX(user_id)
```

---

# mentions

Stores user mentions.

Example:

```text
@john
```

## Columns

| Column            | Type                     |
| ----------------- | ------------------------ |
| id                | UUID                     |
| comment_id        | UUID FK task_comments.id |
| mentioned_user_id | UUID FK users.id         |
| created_at        | TIMESTAMPTZ              |

## Indexes

```sql
INDEX(comment_id)

INDEX(mentioned_user_id)
```

---

# notifications

User notification center.

## Columns

| Column      | Type                  |
| ----------- | --------------------- |
| id          | UUID                  |
| user_id     | UUID FK users.id      |
| type        | ENUM NotificationType |
| title       | VARCHAR(255)          |
| message     | TEXT                  |
| entity_type | VARCHAR(50)           |
| entity_id   | UUID                  |
| is_read     | BOOLEAN               |
| created_at  | TIMESTAMPTZ           |

## Indexes

```sql
INDEX(user_id)

INDEX(is_read)

INDEX(created_at)
```

---

# activity_logs

Workspace activity feed.

## Columns

| Column        | Type                  |
| ------------- | --------------------- |
| id            | UUID                  |
| workspace_id  | UUID FK workspaces.id |
| user_id       | UUID FK users.id      |
| activity_type | ENUM ActivityType     |
| entity_type   | VARCHAR(50)           |
| entity_id     | UUID                  |
| metadata      | JSONB                 |
| created_at    | TIMESTAMPTZ           |

## Indexes

```sql
INDEX(workspace_id)

INDEX(user_id)

INDEX(created_at)
```

---

# Relationship Overview

```text
User
│
├── Workspace Memberships
│
Workspace
│
├── Projects
│
Project
│
├── Boards
│
Board
│
├── Columns
│
Column
│
├── Tasks
│
Task
│
├── Comments
│
├── Mentions
│
├── Notifications
│
└── Activity Logs
```

---

# Cascade Rules

Workspace Deleted

↓

Projects Deleted

↓

Boards Deleted

↓

Columns Deleted

↓

Tasks Deleted

↓

Comments Deleted

↓

Mentions Deleted

---

# Deferred Tables (Not V1)

These are intentionally excluded.

Future releases may add:

```text
labels

task_labels

attachments

watchers

saved_views

conversations

messages

analytics_snapshots

ai_summaries

vector_embeddings
```

No migration should include these tables during V1 development.

---

# V1 Scope Validation

This schema supports:

* Authentication
* OAuth
* Workspaces
* Projects
* Kanban Boards
* Drag-and-Drop Ordering
* Comments
* Mentions
* Notifications
* Activity Logs

This schema is considered stable for V1 implementation.
