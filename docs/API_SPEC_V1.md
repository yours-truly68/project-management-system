# API_SPEC_V1.md

## Purpose

This document defines the API contract for V1.

It acts as the source of truth for:

* FastAPI Routers
* Service Layer
* Frontend Integration
* API Documentation
* Testing

All endpoints should follow this specification unless a documented architectural change is approved.

---

# API Conventions

## Base URL

```http
/api/v1
```

Example:

```http
/api/v1/auth/login
```

---

## Response Format

### Success

```json
{
  "success": true,
  "data": {}
}
```

---

### Error

```json
{
  "success": false,
  "message": "Error message"
}
```

---

# Authentication

Authentication Type:

```text
JWT Access Token
JWT Refresh Token
```

Protected Routes Require:

```http
Authorization: Bearer <token>
```

---

# AUTH MODULE

## Register

### Endpoint

```http
POST /auth/register
```

### Request

```json
{
  "full_name": "Mohammad Razim",
  "username": "razim",
  "email": "razim@example.com",
  "password": "password123"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "user_id": "uuid"
  }
}
```

### Status Codes

```text
201 Created
400 Bad Request
409 Conflict
```

---

## Login

### Endpoint

```http
POST /auth/login
```

### Request

```json
{
  "email": "razim@example.com",
  "password": "password123"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "access_token": "...",
    "token_type": "Bearer"
  }
}
```

### Status Codes

```text
200 OK
401 Unauthorized
```

---

## Refresh Token

### Endpoint

```http
POST /auth/refresh
```

### Response

```json
{
  "success": true,
  "data": {
    "access_token": "..."
  }
}
```

---

## Logout

### Endpoint

```http
POST /auth/logout
```

Clears refresh token cookie.

---

## Google OAuth

### Endpoint

```http
GET /auth/google/login
```

---

## GitHub OAuth

### Endpoint

```http
GET /auth/github/login
```

---

# USERS MODULE

## Current User

### Endpoint

```http
GET /users/me
```

### Response

```json
{
  "id": "uuid",
  "full_name": "Mohammad Razim",
  "username": "razim",
  "email": "razim@example.com",
  "avatar_url": null
}
```

---

## Update Profile

### Endpoint

```http
PATCH /users/me
```

### Request

```json
{
  "full_name": "New Name",
  "avatar_url": "https://..."
}
```

---

# WORKSPACES MODULE

## Create Workspace

### Endpoint

```http
POST /workspaces
```

### Request

```json
{
  "name": "Development Team"
}
```

---

## Get My Workspaces

### Endpoint

```http
GET /workspaces
```

---

## Get Workspace

### Endpoint

```http
GET /workspaces/{workspace_id}
```

---

## Update Workspace

### Endpoint

```http
PATCH /workspaces/{workspace_id}
```

---

## Delete Workspace

### Endpoint

```http
DELETE /workspaces/{workspace_id}
```

Owner Only.

---

# WORKSPACE MEMBERS

## Invite Member

### Endpoint

```http
POST /workspaces/{workspace_id}/members
```

### Request

```json
{
  "email": "john@example.com",
  "role": "MEMBER"
}
```

---

## List Members

### Endpoint

```http
GET /workspaces/{workspace_id}/members
```

---

## Update Member Role

### Endpoint

```http
PATCH /workspaces/{workspace_id}/members/{member_id}
```

---

## Remove Member

### Endpoint

```http
DELETE /workspaces/{workspace_id}/members/{member_id}
```

---

# PROJECTS MODULE

## Create Project

### Endpoint

```http
POST /projects
```

### Request

```json
{
  "workspace_id": "uuid",
  "name": "PMS Backend",
  "description": "Project description"
}
```

---

## Get Projects

### Endpoint

```http
GET /projects
```

### Query Params

```http
workspace_id=<uuid>
```

---

## Get Project

### Endpoint

```http
GET /projects/{project_id}
```

---

## Update Project

### Endpoint

```http
PATCH /projects/{project_id}
```

---

## Archive Project

### Endpoint

```http
PATCH /projects/{project_id}/archive
```

---

## Delete Project

### Endpoint

```http
DELETE /projects/{project_id}
```

---

# BOARDS MODULE

## Create Board

### Endpoint

```http
POST /boards
```

### Request

```json
{
  "project_id": "uuid",
  "name": "Development Board"
}
```

---

## Get Board

### Endpoint

```http
GET /boards/{board_id}
```

Returns:

* Board
* Columns
* Tasks

---

## Update Board

### Endpoint

```http
PATCH /boards/{board_id}
```

---

## Delete Board

### Endpoint

```http
DELETE /boards/{board_id}
```

---

# COLUMNS MODULE

## Create Column

### Endpoint

```http
POST /columns
```

### Request

```json
{
  "board_id": "uuid",
  "name": "Todo",
  "position": 1
}
```

---

## Update Column

### Endpoint

```http
PATCH /columns/{column_id}
```

---

## Reorder Columns

### Endpoint

```http
PATCH /columns/reorder
```

### Request

```json
{
  "board_id": "uuid",
  "columns": [
    {
      "id": "uuid",
      "position": 1
    }
  ]
}
```

---

## Delete Column

### Endpoint

```http
DELETE /columns/{column_id}
```

---

# TASKS MODULE

## Create Task

### Endpoint

```http
POST /tasks
```

### Request

```json
{
  "column_id": "uuid",
  "title": "Implement JWT",
  "description": "Create auth system",
  "priority": "HIGH"
}
```

---

## Get Task

### Endpoint

```http
GET /tasks/{task_id}
```

---

## Update Task

### Endpoint

```http
PATCH /tasks/{task_id}
```

---

## Delete Task

### Endpoint

```http
DELETE /tasks/{task_id}
```

---

## Move Task

Supports drag-and-drop.

### Endpoint

```http
PATCH /tasks/move
```

### Request

```json
{
  "task_id": "uuid",
  "source_column_id": "uuid",
  "destination_column_id": "uuid",
  "new_position": 2
}
```

---

## Assign Task

### Endpoint

```http
PATCH /tasks/{task_id}/assign
```

### Request

```json
{
  "assignee_id": "uuid"
}
```

Creates notification.

---

# COMMENTS MODULE

## Add Comment

### Endpoint

```http
POST /tasks/{task_id}/comments
```

### Request

```json
{
  "content": "Please review this @john"
}
```

---

## Edit Comment

### Endpoint

```http
PATCH /comments/{comment_id}
```

---

## Delete Comment

### Endpoint

```http
DELETE /comments/{comment_id}
```

---

# NOTIFICATIONS MODULE

## Get Notifications

### Endpoint

```http
GET /notifications
```

---

## Mark Read

### Endpoint

```http
PATCH /notifications/{notification_id}/read
```

---

## Mark All Read

### Endpoint

```http
PATCH /notifications/read-all
```

---

# ACTIVITY LOGS MODULE

## Workspace Activity Feed

### Endpoint

```http
GET /workspaces/{workspace_id}/activity
```

---

# Health Check

## Health Endpoint

```http
GET /health
```

### Response

```json
{
  "status": "healthy"
}
```

---

# Deferred APIs

Not included in V1.

```text
Attachments

Labels

Saved Views

Watchers

Direct Messages

WebSockets

Analytics

AI Features

Calendar

Sprints
```

---

# API Versioning Strategy

All endpoints must be versioned.

Current:

```http
/api/v1
```

Future:

```http
/api/v2
```

Breaking changes require a new API version.

---

# V1 Completion Criteria

V1 is considered complete when:

* Authentication works
* OAuth works
* Workspaces work
* Projects work
* Boards work
* Columns work
* Tasks work
* Comments work
* Mentions work
* Notifications work
* Activity logs work
* OpenAPI documentation is generated successfully
* Test coverage exists for core business logic
