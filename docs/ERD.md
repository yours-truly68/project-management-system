# ERD.md

# Entity Relationship Diagram

## Purpose

This document describes the relationships between all V1 entities.

It acts as a visual and architectural reference for:

* SQLAlchemy Relationships
* Database Design
* Repository Design
* API Design
* Future Feature Expansion

This document should always match `DATABASE_SCHEMA_V1.md`.

---

# High Level System Diagram

```text
User
│
├── Workspace Memberships
│
Workspace
│
├── Projects
│   │
│   └── Boards
│       │
│       └── Columns
│           │
│           └── Tasks
│               │
│               ├── Comments
│               │   │
│               │   └── Mentions
│               │
│               └── Notifications
│
└── Activity Logs
```

---

# Core Hierarchy

```text
Workspace
│
├── Project
│   │
│   └── Board
│       │
│       └── Column
│           │
│           └── Task
```

Example:

```text
Engineering Workspace

├── PMS Project
│
└── Development Board
    │
    ├── Todo
    ├── In Progress
    ├── Review
    └── Done
```

---

# Users

```text
users
```

Represents all authenticated users.

Relationships:

```text
User

1 ──────────────── * WorkspaceMember

1 ──────────────── * Project (created_by)

1 ──────────────── * Task (created_by)

1 ──────────────── * Task (assignee)

1 ──────────────── * TaskComment

1 ──────────────── * Notification

1 ──────────────── * ActivityLog
```

---

# Workspaces

```text
workspaces
```

Top-level container.

Relationships:

```text
Workspace

1 ──────────────── * WorkspaceMember

1 ──────────────── * Project

1 ──────────────── * ActivityLog
```

Owner:

```text
Workspace

* ──────────────── 1 User
```

---

# Workspace Members

```text
workspace_members
```

Join table.

Relationships:

```text
WorkspaceMember

* ──────────────── 1 Workspace

* ──────────────── 1 User
```

Roles:

```text
OWNER
ADMIN
MEMBER
```

Constraint:

```text
(workspace_id, user_id)
must be unique
```

---

# Projects

```text
projects
```

Relationships:

```text
Project

* ──────────────── 1 Workspace

* ──────────────── 1 User (creator)

1 ──────────────── * Board
```

---

# Boards

```text
boards
```

Relationships:

```text
Board

* ──────────────── 1 Project

1 ──────────────── * Column

1 ──────────────── * Task
```

A board contains multiple columns.

---

# Columns

```text
columns
```

Relationships:

```text
Column

* ──────────────── 1 Board

1 ──────────────── * Task
```

Ordering:

```text
position
```

Used for:

* Column Reordering
* Kanban Layout

Example:

```text
Todo          position=1

In Progress   position=2

Review        position=3

Done          position=4
```

Constraint:

```text
(board_id, position)
must be unique
```

---

# Tasks

```text
tasks
```

Core work item.

Relationships:

```text
Task

* ──────────────── 1 Board

* ──────────────── 1 Column

* ──────────────── 1 User (creator)

* ──────────────── 1 User (assignee)

1 ──────────────── * TaskComment
```

Ordering:

```text
position
```

Used for:

* Drag and Drop
* Task Sorting

Constraint:

```text
(column_id, position)
must be unique
```

Example:

```text
Column: Todo

Task A  position=1

Task B  position=2

Task C  position=3
```

---

# Task Comments

```text
task_comments
```

Relationships:

```text
TaskComment

* ──────────────── 1 Task

* ──────────────── 1 User

1 ──────────────── * Mention
```

Purpose:

* Collaboration
* Discussions
* Reviews

---

# Mentions

```text
mentions
```

Purpose:

Support:

```text
@username
```

Relationships:

```text
Mention

* ──────────────── 1 TaskComment

* ──────────────── 1 User
```

Flow:

```text
Comment Created

↓

Mention Parsed

↓

Mention Record Created

↓

Notification Created
```

---

# Notifications

```text
notifications
```

Relationships:

```text
Notification

* ──────────────── 1 User
```

Examples:

```text
Task Assigned

Task Mentioned

Task Due Soon

Task Overdue

Project Invitation
```

---

# Activity Logs

```text
activity_logs
```

Purpose:

Audit trail.

Relationships:

```text
ActivityLog

* ──────────────── 1 Workspace

* ──────────────── 1 User
```

Examples:

```text
Task Created

Task Updated

Task Deleted

Task Moved

Comment Created
```

Activity logs are immutable.

---

# Cascade Rules

## Workspace Deleted

```text
Workspace

↓

Workspace Members

↓

Projects

↓

Boards

↓

Columns

↓

Tasks

↓

Comments

↓

Mentions
```

Notifications and activity logs may be deleted depending on retention policy.

Current V1:

```text
Delete with Workspace
```

---

# Cardinality Summary

## User

```text
User

1 ──────────────── * WorkspaceMember

1 ──────────────── * Project

1 ──────────────── * Task

1 ──────────────── * Comment

1 ──────────────── * Notification

1 ──────────────── * ActivityLog
```

---

## Workspace

```text
Workspace

1 ──────────────── * Members

1 ──────────────── * Projects

1 ──────────────── * ActivityLogs
```

---

## Project

```text
Project

1 ──────────────── * Boards
```

---

## Board

```text
Board

1 ──────────────── * Columns

1 ──────────────── * Tasks
```

---

## Column

```text
Column

1 ──────────────── * Tasks
```

---

## Task

```text
Task

1 ──────────────── * Comments
```

---

## Comment

```text
Comment

1 ──────────────── * Mentions
```

---

# Future Relationships (Not V1)

Reserved for future releases.

```text
Labels

TaskLabels

Attachments

SavedViews

Watchers

Conversations

Messages

Analytics

AI Summaries

Embeddings
```

These entities are intentionally excluded from V1.

---

# V1 Architecture Validation

This ERD supports:

✅ Authentication

✅ OAuth

✅ Workspaces

✅ Projects

✅ Kanban Boards

✅ Dynamic Columns

✅ Drag-and-Drop Ordering

✅ Task Assignment

✅ Comments

✅ Mentions

✅ Notifications

✅ Activity Logs

This ERD is considered the authoritative relationship model for V1.
