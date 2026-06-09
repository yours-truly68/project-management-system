# Kanban Project Management System (Backend)

A production-grade Project Management System inspired by Linear, Jira, ClickUp, and Monday.

This project was built to demonstrate backend engineering, software architecture, database design, authentication, authorization, API design, and scalable system development.

---

## Features

### Authentication

* Email & Password Authentication
* JWT Access Tokens
* JWT Refresh Tokens
* Google OAuth (planned)
* GitHub OAuth (planned)

### Workspace Management

* Create Workspaces
* Workspace Membership
* Role-Based Access Control

Roles:

* OWNER
* ADMIN
* MEMBER

### Project Management

* Projects
* Boards
* Columns
* Tasks

### Collaboration

* Comments
* Mentions
* Notifications
* Activity Logs

---

## Tech Stack

### Backend

* Python 3.13+
* FastAPI
* SQLAlchemy 2.x
* Pydantic v2
* Alembic

### Database

* PostgreSQL

### Authentication

* JWT
* Passlib
* Authlib

### Package Manager

* uv

---

## Architecture

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

### Responsibilities

#### Router

* Request Validation
* Response Serialization
* Dependency Injection

#### Service

* Business Logic
* Authorization
* Orchestration

#### Repository

* Database Access
* Query Logic

#### Database

* Persistence Layer

---

## Project Structure

```text
app/

├── auth/
├── users/
├── workspaces/
├── projects/
├── boards/
├── columns/
├── tasks/
├── comments/
├── mentions/
├── notifications/
├── activity_logs/
│
├── core/
├── database/
└── shared/
```

---

## Database Design

Primary Keys:

* UUIDv7

Timestamps:

* created_at
* updated_at

All timestamps are timezone-aware.

---

## Permission System

Workspace Roles:

* OWNER
* ADMIN
* MEMBER

Authorization is centralized through the permissions layer.

Business logic never lives inside routers or repositories.

---

## API Modules

* Authentication
* Users
* Workspaces
* Projects
* Boards
* Columns
* Tasks
* Comments
* Mentions
* Notifications
* Activity Logs

---

## Future Roadmap

### V1.5

* Labels
* Filters
* Search
* Attachments
* Templates

### V2

* Redis
* WebSockets
* Real-Time Collaboration

### V3

* AI Task Generation
* Sprint Summaries
* Risk Analysis
* Semantic Search
* pgvector

---

## Documentation

Additional project documentation:

* AI_CONTEXT.md
* TECH_DEBT.md
* API_CONTRACT.md
* ERD.md
* DATABASE_SCHEMA.md
* PROJECT_ARCHITECTURE.md
* PERMISSIONS_MATRIX.md

---

## Status

Current Status:

Backend V1 Complete

Next Phase:

Frontend Development
