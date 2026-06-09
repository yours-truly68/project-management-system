# DEVELOPMENT_WORKFLOW.md

# Purpose

This document defines how development is performed throughout the project lifecycle.

Goals:

* Consistency
* Maintainability
* Predictability
* Clean Git History
* Safe Database Migrations
* Production-grade Development Practices

---

# Development Philosophy

Priorities:

```text
Correctness
↓
Maintainability
↓
Performance
↓
Premature Optimization
```

Avoid:

* Overengineering
* Unnecessary Abstractions
* Early Microservices
* Complex Design Patterns

Prefer:

* Simplicity
* Explicit Code
* Small Modules
* Incremental Development

---

# Architecture Rules

Architecture:

```text
Router
↓
Service
↓
Repository
↓
Database
```

---

## Router Responsibilities

Allowed:

* Request Validation
* Response Serialization
* Dependency Injection
* Status Codes

Not Allowed:

* Business Logic
* Authorization Logic
* Database Queries

---

## Service Responsibilities

Allowed:

* Business Logic
* Authorization
* Validation
* Use Case Orchestration

Examples:

```text
Create Workspace

Assign Task

Move Task

Archive Project
```

---

## Repository Responsibilities

Allowed:

* Database Queries
* Data Persistence

Not Allowed:

* Business Logic
* Authorization
* HTTP Concerns

---

# Git Workflow

## Main Branch

```text
main
```

Always deployable.

Never commit unfinished work directly.

---

## Feature Branches

Naming Convention:

```text
feature/auth-register

feature/google-oauth

feature/workspaces

feature/projects

feature/tasks

feature/notifications
```

---

## Fix Branches

```text
fix/task-ordering

fix/auth-bug

fix/migration-issue
```

---

## Refactor Branches

```text
refactor/task-service

refactor/user-repository
```

---

# Commit Convention

Format:

```text
type: description
```

---

## Chore

```text
chore: initialize project structure

chore: configure alembic
```

---

## Feature

```text
feat: add user registration

feat: implement task assignment
```

---

## Fix

```text
fix: prevent duplicate workspace members
```

---

## Refactor

```text
refactor: simplify task move service
```

---

## Docs

```text
docs: add api specification

docs: update architecture guide
```

---

## Test

```text
test: add task service tests
```

---

# Database Workflow

## Rule 1

Never manually modify production tables.

Use Alembic.

Always.

---

## Rule 2

Every schema change requires:

```text
Model Change
↓
Migration Generation
↓
Migration Review
↓
Migration Apply
```

---

## Generate Migration

```bash
alembic revision --autogenerate -m "create users table"
```

---

## Review Migration

Before applying:

Verify:

* Columns
* Indexes
* Constraints
* Foreign Keys

Never blindly apply migrations.

---

## Apply Migration

```bash
alembic upgrade head
```

---

# Testing Strategy

Testing Pyramid:

```text
Unit Tests
↓
Integration Tests
↓
End-to-End Tests
```

---

## Unit Tests

Focus:

* Services
* Business Logic

Examples:

```text
Task Assignment

Workspace Permissions

Notification Creation
```

---

## Integration Tests

Focus:

* Database Interactions
* Repositories

Examples:

```text
User Creation

Task Queries

Project Queries
```

---

## API Tests

Focus:

* Endpoints
* Authentication
* Authorization

---

# Code Review Checklist

Before merging:

## Architecture

* Correct Layer?
* No Business Logic in Router?
* No Business Logic in Repository?

---

## Database

* Correct Relationships?
* Correct Constraints?
* Correct Indexes?

---

## Security

* Authorization Checked?
* User Ownership Verified?
* JWT Protected?

---

## Performance

* Avoid N+1 Queries
* Use Proper Indexes
* Avoid Unnecessary Queries

---

## Maintainability

* Readable?
* Typed?
* Consistent Naming?

---

# Naming Conventions

## Files

```text
router.py

service.py

repository.py

schemas.py

models.py
```

---

## Classes

```python
UserService

TaskRepository

WorkspaceCreate

ProjectResponse
```

---

## Functions

```python
create_user()

assign_task()

move_task()

archive_project()
```

---

# Logging Strategy

V1:

Use standard Python logging.

Log:

* Errors
* Authentication Failures
* Unexpected Exceptions

Do Not Log:

* Passwords
* JWT Tokens
* Sensitive User Data

---

# Security Rules

Passwords:

```text
Never store plaintext passwords.
```

Use:

```text
bcrypt
```

through:

```text
passlib
```

---

JWT:

```text
Short-lived Access Token

Long-lived Refresh Token
```

---

Refresh Tokens:

```text
HttpOnly Cookie
```

Always.

---

# API Versioning

Current:

```text
/api
```

Future:

```text
/api/v2
```

Breaking changes require a new version.

---

# Development Phases

## Sprint 1

Backend Foundation

```text
Config
Database
Base Model
Session
Alembic
Enums
Models
Migration
```

---

## Sprint 2

Authentication

```text
Users
JWT
Refresh Tokens
OAuth
```

---

## Sprint 3

Core Domain

```text
Workspaces
Projects
Boards
Columns
Tasks
```

---

## Sprint 4

Collaboration

```text
Comments
Mentions
Notifications
Activity Logs
```

---

## Sprint 5

Frontend Foundation

```text
Next.js
Design System
Layout
Theme
```

---

## Sprint 6

Kanban UI

```text
Projects
Boards
Task Modal
Drag and Drop
```

---

## Sprint 7

Integration

```text
API Integration

Authentication Flow

Production Readiness
```

---

# Definition of Done

A feature is complete only when:

✅ Code Implemented

✅ Types Added

✅ Tests Added

✅ Migration Created (if needed)

✅ API Updated

✅ Documentation Updated

✅ Reviewed

Only then is a feature considered finished.
