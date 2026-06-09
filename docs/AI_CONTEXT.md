# AI_CONTEXT.md

## Project

Kanban Project Management System (PMS)

Inspired by:

* Linear
* Jira
* ClickUp
* Monday

Goal:

Build a production-grade SaaS application that demonstrates:

* Software Architecture
* Backend Engineering
* Database Design
* API Design
* Frontend Engineering
* Scalability
* Future AI Integration

---

# Current Status

Project Phase:

Sprint 1

Backend Foundation

Completed:

* Project Planning
* Architecture Decisions
* Database Design
* API Design
* Permissions Design

Implementation is beginning.

---

# Architecture

Architecture Style:

Modular Monolith

Application Flow:

Router
↓
Service
↓
Repository
↓
PostgreSQL

Responsibilities:

Router:

* Validation
* Serialization
* Dependency Injection

Service:

* Business Logic
* Authorization
* Use Case Orchestration

Repository:

* Database Queries

Database:

* Persistence

Authorization must happen in Services.

Never place business logic inside Routers.

Never place business logic inside Repositories.

---

# Backend Stack

* Python 3.13+
* FastAPI
* SQLAlchemy 2.x
* Alembic
* Pydantic v2
* PostgreSQL
* Async SQLAlchemy

Package Manager:

* uv

---

# Frontend Stack

* Next.js 15+
* TypeScript
* Tailwind CSS
* shadcn/ui
* TanStack Query
* dnd-kit
* Zustand

Typography:

Primary:

* Satoshi

Fallback:

* Inter

---

# Database Standards

Primary Keys:

UUID v7

Library:

```python
from uuid6 import uuid7
```

Generate UUIDs in the application layer.

Never use auto-increment IDs.

---

All Models Must Use:

```python
Mapped
mapped_column
```

Avoid legacy SQLAlchemy Column API.

---

Timestamps:

```python
created_at
updated_at
```

Requirements:

* Timezone Aware
* server_default=func.now()

---

# Authentication

Supported Login Methods:

1. Email + Password
2. Google OAuth
3. GitHub OAuth

Authentication Strategy:

JWT Access Token

JWT Refresh Token

Access Token:

* 15 minutes

Refresh Token:

* 7–30 days

Storage:

Access Token:

* Memory

Refresh Token:

* HttpOnly Cookie

---

# Backend Modules

app/

├── auth/
├── users/
├── workspaces/
├── projects/
├── boards/
├── columns/
├── tasks/
├── activity_logs/
│
├── core/
├── database/
└── shared/

Each feature follows:

feature/

├── router.py
├── service.py
├── repository.py
├── schemas.py
└── models.py

---

# Database Tables

V1 Tables:

users

workspaces
workspace_members

projects

boards
columns

tasks

task_comments
mentions

notifications

activity_logs

---

# Workspace Hierarchy

Workspace
│
├── Projects
│
├── Boards
│
├── Columns
│
└── Tasks

Example:

Workspace
└── Project
└── Board
├── Todo
├── In Progress
├── Review
└── Done

Columns are dynamic.

Statuses are NOT hardcoded.

---

# V1 Features

Authentication

* Register
* Login
* Logout
* Refresh Token
* Google OAuth
* GitHub OAuth

Users

Workspaces

Projects

Boards

Columns

Tasks

Task Assignment

Task Priorities

Task Due Dates

Comments

Mentions

Notifications

Activity Logs

---

# Permissions

Workspace Roles:

OWNER

ADMIN

MEMBER

Authorization must follow:

PERMISSIONS_MATRIX.md

Do not invent additional roles.

---

# Frontend Design Direction

Inspired By:

* Linear
* Raycast
* Notion
* Vercel Dashboard

Characteristics:

* Minimal
* Modern
* Fast
* Information Dense

---

# Theme System

Support:

* Dark Mode
* Light Mode

Dark Mode is primary.

Use design tokens.

Do not hardcode colors.

---

# V1 Exclusions

Do NOT implement:

* Redis
* WebSockets
* Direct Messaging
* Analytics
* AI Features
* Calendar
* Sprints
* Attachments
* Labels
* Saved Views
* Watchers

These belong to future releases.

---

# Future Releases

V1.5

* Labels
* Filters
* Search
* Watchers
* Attachments
* Markdown
* Checklists
* Templates
* Animal Archetype Profile

V2

* Redis
* WebSockets
* Presence
* Real-Time Updates

V3

* AI Task Generation
* Sprint Summaries
* Risk Analysis
* Semantic Search
* pgvector

---

# Development Rules

Always:

* Use type hints.
* Use async SQLAlchemy.
* Use production-grade defaults.
* Create Alembic migrations for schema changes.
* Review migrations before applying them.
* Follow SQLAlchemy 2.x patterns.
* Prefer explicit code over clever abstractions.

Current Goal:

Continue implementation according to the architecture and decisions defined in this document.