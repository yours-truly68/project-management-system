# TECH_DEBT.md

## Purpose

This document tracks known technical debt, architectural improvements, scalability concerns, and deferred implementation decisions.

Items listed here are intentional decisions that have been postponed to maintain delivery speed for V1.

---

# Current Status

Project:

Kanban Project Management System

Architecture:

Modular Monolith

Backend Stack:

* FastAPI
* PostgreSQL
* SQLAlchemy 2.x
* Alembic
* Async SQLAlchemy

Last Updated:

V1 Development

---

# High Priority Technical Debt

## Task Reordering Concurrency

### Status

Partially Addressed

### Problem

Task movement and reordering operations may experience race conditions under concurrent access.

Examples:

* Two users move tasks simultaneously.
* Two users reorder the same column.
* Multiple drag-and-drop operations occur at the same time.

Potential issues:

* Duplicate positions
* Position gaps
* Unique constraint violations

### Current Solution

* Transactional updates
* Bulk position updates

### Future Improvement

Implement:

* Row-level locking
* SELECT FOR UPDATE
* Optimistic concurrency control

Priority:

High

Target Release:

V1.1

---

# Medium Priority Technical Debt

## Domain Event System

### Status

Deferred

### Problem

Future modules will generate side effects:

* Activity Logs
* Notifications
* WebSocket Events
* Analytics
* AI Processing

Direct service-to-service calls create coupling.

Example:

Task Created
↓
Create Activity Log
↓
Create Notification
↓
Publish WebSocket Event

This increases transaction complexity and latency.

### Future Improvement

Introduce domain events.

Example:

Task Created
↓
Publish Event
↓
Activity Log Handler
↓
Notification Handler
↓
WebSocket Handler

Potential approaches:

* In-process Event Bus
* Redis Pub/Sub
* Message Queue

Priority:

Medium

Target Release:

V2

---

## Notification Delivery Architecture

### Status

Deferred

### Problem

Notifications currently planned as synchronous database operations.

As notification volume increases:

* API latency increases
* Transaction complexity increases

### Future Improvement

Move notification processing to background jobs.

Potential technologies:

* Redis
* Celery
* Dramatiq
* RQ

Priority:

Medium

Target Release:

V2

---

# Low Priority Technical Debt

## Audit Logging Infrastructure

### Status

Deferred

### Problem

Activity Logs currently planned as direct database writes.

Future requirements may include:

* Filtering
* Search
* Export
* Compliance auditing

### Future Improvement

Introduce structured audit events.

Possible implementation:

* Event-driven logging
* Dedicated audit service
* Append-only audit store

Priority:

Low

Target Release:

V2

---

## Search Infrastructure

### Status

Not Implemented

### Problem

Task and project search currently rely on standard database queries.

Future requirements:

* Full-text search
* Global search
* Filtering
* Ranking

### Future Improvement

Evaluate:

* PostgreSQL Full Text Search
* Meilisearch
* Elasticsearch

Priority:

Low

Target Release:

V2

---

# Future Architectural Improvements

## Redis Integration

Planned Uses:

* Caching
* Rate Limiting
* Session Management
* Background Jobs
* Pub/Sub

Status:

Not Implemented

Target Release:

V2

---

## Real-Time Collaboration

Planned Features:

* Presence
* Live Task Updates
* Live Board Updates
* Typing Indicators

Requirements:

* WebSockets
* Redis Pub/Sub

Status:

Not Implemented

Target Release:

V2

---

## AI Infrastructure

Planned Features:

* Task Generation
* Sprint Summaries
* Risk Detection
* Semantic Search

Requirements:

* OpenAI
* Anthropic
* pgvector

Status:

Not Implemented

Target Release:

V3

---

# Refactoring Rules

Before introducing any major feature:

1. Review this document.
2. Resolve relevant technical debt.
3. Reassess architectural impact.
4. Update this document.

---

# Definition of Acceptable Technical Debt

Technical debt is acceptable when:

* The decision is documented.
* The limitation is understood.
* The workaround is intentional.
* The debt does not compromise security.
* The debt does not compromise data integrity.

Technical debt is NOT acceptable when:

* It introduces security risks.
* It causes data corruption.
* It violates architectural boundaries.
* It prevents future development.

---

# Review Schedule

Review this document:

* Before each major release
* Before introducing Redis
* Before introducing WebSockets
* Before introducing AI features
* Before scaling beyond a single application instance
