# API Contract Specification (V1)

This document is the absolute source of truth for all V1 backend API endpoints. It defines the exact methods, routes, request models, and response payloads for frontend consumption.

## Base URL
All API routes are prefixed with:
```http
/api
```

---

## 1. Authentication Module

### Register User
* **Method**: `POST`
* **Route**: `/auth/register`
* **Authentication Requirement**: None (Public)
* **Request Body**:
```json
{
  "email": "user@example.com",
  "username": "username123",
  "full_name": "Full Name",
  "password": "strongpassword123"
}
```
* **Response Body (201 Created)**:
```json
{
  "tokens": {
    "access_token": "eyJhbG...",
    "refresh_token": "eyJhbG...",
    "token_type": "bearer"
  },
  "user": {
    "id": "3b2e35a1-432d-4566-a3d5-1ff2506e789a",
    "email": "user@example.com",
    "username": "username123",
    "full_name": "Full Name",
    "auth_provider": "local",
    "avatar_url": null,
    "is_active": true,
    "is_verified": false,
    "created_at": "2026-06-09T04:00:00Z",
    "updated_at": "2026-06-09T04:00:00Z"
  }
}
```

---

### Login
* **Method**: `POST`
* **Route**: `/auth/login`
* **Authentication Requirement**: None (Public)
* **Request Body**:
```json
{
  "email": "user@example.com",
  "password": "strongpassword123"
}
```
* **Response Body (200 OK)**:
```json
{
  "tokens": {
    "access_token": "eyJhbG...",
    "refresh_token": "eyJhbG...",
    "token_type": "bearer"
  },
  "user": {
    "id": "3b2e35a1-432d-4566-a3d5-1ff2506e789a",
    "email": "user@example.com",
    "username": "username123",
    "full_name": "Full Name",
    "auth_provider": "local",
    "avatar_url": null,
    "is_active": true,
    "is_verified": false,
    "created_at": "2026-06-09T04:00:00Z",
    "updated_at": "2026-06-09T04:00:00Z"
  }
}
```

---

### Refresh Access Token
* **Method**: `POST`
* **Route**: `/auth/refresh`
* **Authentication Requirement**: None (Public)
* **Request Body**:
```json
{
  "refresh_token": "eyJhbG_refresh..."
}
```
* **Response Body (200 OK)**:
```json
{
  "access_token": "eyJhbG_new_access...",
  "refresh_token": "eyJhbG_new_refresh...",
  "token_type": "bearer"
}
```

---

### Logout
* **Method**: `POST`
* **Route**: `/auth/logout`
* **Authentication Requirement**: None
* **Request Body**: None
* **Response (204 No Content)**: Empty Body

---

### Current User Session Info (`/me`)
* **Method**: `GET`
* **Route**: `/auth/me`
* **Authentication Requirement**: Bearer Token (`Authorization: Bearer <access_token>`)
* **Request Body**: None
* **Response Body (200 OK)**:
```json
{
  "id": "3b2e35a1-432d-4566-a3d5-1ff2506e789a",
  "email": "user@example.com",
  "username": "username123",
  "full_name": "Full Name",
  "auth_provider": "local",
  "avatar_url": "https://avatar-host.com/user.png",
  "is_active": true,
  "is_verified": false,
  "created_at": "2026-06-09T04:00:00Z",
  "updated_at": "2026-06-09T04:00:00Z"
}
```

---

## 2. Workspaces Module

### Create Workspace
* **Method**: `POST`
* **Route**: `/workspaces`
* **Authentication Requirement**: Bearer Token
* **Request Body**:
```json
{
  "name": "Acme Workspace",
  "slug": "acme-workspace",
  "description": "Optional workspace overview"
}
```
* **Response Body (201 Created)**:
```json
{
  "id": "4c3e35a1-432d-4566-a3d5-1ff2506e789b",
  "name": "Acme Workspace",
  "slug": "acme-workspace",
  "description": "Optional workspace overview",
  "owner_id": "3b2e35a1-432d-4566-a3d5-1ff2506e789a",
  "created_at": "2026-06-09T04:05:00Z",
  "updated_at": "2026-06-09T04:05:00Z"
}
```

---

### List User Workspaces
* **Method**: `GET`
* **Route**: `/workspaces`
* **Authentication Requirement**: Bearer Token
* **Request Body**: None
* **Response Body (200 OK)**:
```json
[
  {
    "id": "4c3e35a1-432d-4566-a3d5-1ff2506e789b",
    "name": "Acme Workspace",
    "slug": "acme-workspace",
    "description": "Optional workspace overview",
    "owner_id": "3b2e35a1-432d-4566-a3d5-1ff2506e789a",
    "created_at": "2026-06-09T04:05:00Z",
    "updated_at": "2026-06-09T04:05:00Z"
  }
]
```

---

### Get Single Workspace Details
* **Method**: `GET`
* **Route**: `/workspaces/{workspace_id}`
* **Authentication Requirement**: Bearer Token
* **Request Body**: None
* **Response Body (200 OK)**:
```json
{
  "id": "4c3e35a1-432d-4566-a3d5-1ff2506e789b",
  "name": "Acme Workspace",
  "slug": "acme-workspace",
  "description": "Optional workspace overview",
  "owner_id": "3b2e35a1-432d-4566-a3d5-1ff2506e789a",
  "created_at": "2026-06-09T04:05:00Z",
  "updated_at": "2026-06-09T04:05:00Z"
}
```

---

### Invite Member to Workspace
* **Method**: `POST`
* **Route**: `/workspaces/{workspace_id}/members`
* **Authentication Requirement**: Bearer Token (ADMIN / OWNER only)
* **Request Body**:
```json
{
  "email": "newuser@example.com",
  "role": "MEMBER" // Accepted: "ADMIN", "MEMBER"
}
```
* **Response Body (201 Created)**:
```json
{
  "detail": "Member invited successfully."
}
```

---

### Remove Member from Workspace
* **Method**: `DELETE`
* **Route**: `/workspaces/{workspace_id}/members/{user_id}`
* **Authentication Requirement**: Bearer Token (OWNER / ADMIN role checking hierarchy)
* **Request Body**: None
* **Response (204 No Content)**: Empty Body

---

## 3. Projects Module

### Create Project
* **Method**: `POST`
* **Route**: `/projects`
* **Authentication Requirement**: Bearer Token
* **Request Body**:
```json
{
  "workspace_id": "4c3e35a1-432d-4566-a3d5-1ff2506e789b",
  "name": "Acme Website redesign",
  "key": "ACME",
  "description": "Optional project description"
}
```
* **Response Body (201 Created)**:
```json
{
  "id": "5d3e35a1-432d-4566-a3d5-1ff2506e789c",
  "workspace_id": "4c3e35a1-432d-4566-a3d5-1ff2506e789b",
  "name": "Acme Website redesign",
  "key": "ACME",
  "description": "Optional project description",
  "created_by": "3b2e35a1-432d-4566-a3d5-1ff2506e789a",
  "is_archived": false,
  "created_at": "2026-06-09T04:10:00Z",
  "updated_at": "2026-06-09T04:10:00Z"
}
```

---

### List Projects
* **Method**: `GET`
* **Route**: `/projects`
* **Authentication Requirement**: Bearer Token
* **Query Parameters**:
  * `workspace_id` (UUID, Required)
  * `include_archived` (Boolean, Default: `false`)
* **Request Body**: None
* **Response Body (200 OK)**:
```json
[
  {
    "id": "5d3e35a1-432d-4566-a3d5-1ff2506e789c",
    "workspace_id": "4c3e35a1-432d-4566-a3d5-1ff2506e789b",
    "name": "Acme Website redesign",
    "key": "ACME",
    "description": "Optional project description",
    "created_by": "3b2e35a1-432d-4566-a3d5-1ff2506e789a",
    "is_archived": false,
    "created_at": "2026-06-09T04:10:00Z",
    "updated_at": "2026-06-09T04:10:00Z"
  }
]
```

---

### Get Project Details
* **Method**: `GET`
* **Route**: `/projects/{project_id}`
* **Authentication Requirement**: Bearer Token
* **Request Body**: None
* **Response Body (200 OK)**:
```json
{
  "id": "5d3e35a1-432d-4566-a3d5-1ff2506e789c",
  "workspace_id": "4c3e35a1-432d-4566-a3d5-1ff2506e789b",
  "name": "Acme Website redesign",
  "key": "ACME",
  "description": "Optional project description",
  "created_by": "3b2e35a1-432d-4566-a3d5-1ff2506e789a",
  "is_archived": false,
  "created_at": "2026-06-09T04:10:00Z",
  "updated_at": "2026-06-09T04:10:00Z"
}
```

---

### Update Project
* **Method**: `PATCH`
* **Route**: `/projects/{project_id}`
* **Authentication Requirement**: Bearer Token
* **Request Body**:
```json
{
  "name": "New Project Title",
  "key": "NEWK",
  "description": "Updated description",
  "is_archived": true
}
```
* **Response Body (200 OK)**:
```json
{
  "id": "5d3e35a1-432d-4566-a3d5-1ff2506e789c",
  "workspace_id": "4c3e35a1-432d-4566-a3d5-1ff2506e789b",
  "name": "New Project Title",
  "key": "NEWK",
  "description": "Updated description",
  "created_by": "3b2e35a1-432d-4566-a3d5-1ff2506e789a",
  "is_archived": true,
  "created_at": "2026-06-09T04:10:00Z",
  "updated_at": "2026-06-09T04:15:00Z"
}
```

---

### Delete Project
* **Method**: `DELETE`
* **Route**: `/projects/{project_id}`
* **Authentication Requirement**: Bearer Token (OWNER / ADMIN only)
* **Request Body**: None
* **Response (204 No Content)**: Empty Body

---

## 4. Boards Module

### Create Board
* **Method**: `POST`
* **Route**: `/boards`
* **Authentication Requirement**: Bearer Token
* **Request Body**:
```json
{
  "project_id": "5d3e35a1-432d-4566-a3d5-1ff2506e789c",
  "name": "Sprint 1 Board",
  "description": "Main delivery board"
}
```
* **Response Body (201 Created)**:
```json
{
  "id": "6e3e35a1-432d-4566-a3d5-1ff2506e789d",
  "project_id": "5d3e35a1-432d-4566-a3d5-1ff2506e789c",
  "name": "Sprint 1 Board",
  "description": "Main delivery board",
  "created_by": "3b2e35a1-432d-4566-a3d5-1ff2506e789a",
  "created_at": "2026-06-09T04:12:00Z",
  "updated_at": "2026-06-09T04:12:00Z"
}
```

---

### List Project Boards
* **Method**: `GET`
* **Route**: `/boards`
* **Authentication Requirement**: Bearer Token
* **Query Parameters**:
  * `project_id` (UUID, Required)
* **Request Body**: None
* **Response Body (200 OK)**:
```json
[
  {
    "id": "6e3e35a1-432d-4566-a3d5-1ff2506e789d",
    "project_id": "5d3e35a1-432d-4566-a3d5-1ff2506e789c",
    "name": "Sprint 1 Board",
    "description": "Main delivery board",
    "created_by": "3b2e35a1-432d-4566-a3d5-1ff2506e789a",
    "created_at": "2026-06-09T04:12:00Z",
    "updated_at": "2026-06-09T04:12:00Z"
  }
]
```

---

### Get Board Details
* **Method**: `GET`
* **Route**: `/boards/{board_id}`
* **Authentication Requirement**: Bearer Token
* **Request Body**: None
* **Response Body (200 OK)**:
```json
{
  "id": "6e3e35a1-432d-4566-a3d5-1ff2506e789d",
  "project_id": "5d3e35a1-432d-4566-a3d5-1ff2506e789c",
  "name": "Sprint 1 Board",
  "description": "Main delivery board",
  "created_by": "3b2e35a1-432d-4566-a3d5-1ff2506e789a",
  "created_at": "2026-06-09T04:12:00Z",
  "updated_at": "2026-06-09T04:12:00Z"
}
```

---

### Update Board
* **Method**: `PATCH`
* **Route**: `/boards/{board_id}`
* **Authentication Requirement**: Bearer Token
* **Request Body**:
```json
{
  "name": "Updated Board Name",
  "description": "Updated board details"
}
```
* **Response Body (200 OK)**:
```json
{
  "id": "6e3e35a1-432d-4566-a3d5-1ff2506e789d",
  "project_id": "5d3e35a1-432d-4566-a3d5-1ff2506e789c",
  "name": "Updated Board Name",
  "description": "Updated board details",
  "created_by": "3b2e35a1-432d-4566-a3d5-1ff2506e789a",
  "created_at": "2026-06-09T04:12:00Z",
  "updated_at": "2026-06-09T04:20:00Z"
}
```

---

### Delete Board
* **Method**: `DELETE`
* **Route**: `/boards/{board_id}`
* **Authentication Requirement**: Bearer Token
* **Request Body**: None
* **Response (204 No Content)**: Empty Body

---

## 5. Columns Module

### Create Column
* **Method**: `POST`
* **Route**: `/columns`
* **Authentication Requirement**: Bearer Token
* **Request Body**:
```json
{
  "board_id": "6e3e35a1-432d-4566-a3d5-1ff2506e789d",
  "name": "To Do",
  "position": 0,
  "color": "#3b82f6" // Valid hex color matching pattern: ^#[0-9a-fA-F]{6}$
}
```
* **Response Body (201 Created)**:
```json
{
  "id": "7f3e35a1-432d-4566-a3d5-1ff2506e789e",
  "board_id": "6e3e35a1-432d-4566-a3d5-1ff2506e789d",
  "name": "To Do",
  "position": 0,
  "color": "#3b82f6",
  "created_at": "2026-06-09T04:14:00Z",
  "updated_at": "2026-06-09T04:14:00Z"
}
```

---

### List Board Columns
* **Method**: `GET`
* **Route**: `/columns`
* **Authentication Requirement**: Bearer Token
* **Query Parameters**:
  * `board_id` (UUID, Required)
* **Request Body**: None
* **Response Body (200 OK)**:
```json
[
  {
    "id": "7f3e35a1-432d-4566-a3d5-1ff2506e789e",
    "board_id": "6e3e35a1-432d-4566-a3d5-1ff2506e789d",
    "name": "To Do",
    "position": 0,
    "color": "#3b82f6",
    "created_at": "2026-06-09T04:14:00Z",
    "updated_at": "2026-06-09T04:14:00Z"
  }
]
```

---

### Update Column
* **Method**: `PATCH`
* **Route**: `/columns/{column_id}`
* **Authentication Requirement**: Bearer Token
* **Request Body**:
```json
{
  "name": "Updated Column Name",
  "position": 1,
  "color": "#10b981"
}
```
* **Response Body (200 OK)**:
```json
{
  "id": "7f3e35a1-432d-4566-a3d5-1ff2506e789e",
  "board_id": "6e3e35a1-432d-4566-a3d5-1ff2506e789d",
  "name": "Updated Column Name",
  "position": 1,
  "color": "#10b981",
  "created_at": "2026-06-09T04:14:00Z",
  "updated_at": "2026-06-09T04:22:00Z"
}
```

---

### Reorder Board Columns
* **Method**: `POST`
* **Route**: `/columns/reorder`
* **Authentication Requirement**: Bearer Token
* **Query Parameters**:
  * `board_id` (UUID, Required)
* **Request Body**:
```json
{
  "ordered_ids": [
    "7f3e35a1-432d-4566-a3d5-1ff2506e789e",
    "8a3e35a1-432d-4566-a3d5-1ff2506e789f"
  ]
}
```
* **Response (204 No Content)**: Empty Body

---

### Delete Column
* **Method**: `DELETE`
* **Route**: `/columns/{column_id}`
* **Authentication Requirement**: Bearer Token
* **Request Body**: None
* **Response (204 No Content)**: Empty Body

---

## 6. Tasks Module

### Create Task
* **Method**: `POST`
* **Route**: `/tasks`
* **Authentication Requirement**: Bearer Token
* **Request Body**:
```json
{
  "column_id": "7f3e35a1-432d-4566-a3d5-1ff2506e789e",
  "title": "Build API Contracts Docs",
  "description": "Outline all schemas and routes for frontend teams",
  "priority": "HIGH", // Accepted values: "LOW", "MEDIUM", "HIGH", "CRITICAL"
  "assignee_id": "3b2e35a1-432d-4566-a3d5-1ff2506e789a",
  "reporter_id": "3b2e35a1-432d-4566-a3d5-1ff2506e789a",
  "due_date": "2026-06-15T18:00:00Z",
  "position": 0
}
```
* **Response Body (201 Created)**:
```json
{
  "id": "9b3e35a1-432d-4566-a3d5-1ff2506e7890",
  "column_id": "7f3e35a1-432d-4566-a3d5-1ff2506e789e",
  "title": "Build API Contracts Docs",
  "description": "Outline all schemas and routes for frontend teams",
  "priority": "HIGH",
  "assignee_id": "3b2e35a1-432d-4566-a3d5-1ff2506e789a",
  "reporter_id": "3b2e35a1-432d-4566-a3d5-1ff2506e789a",
  "due_date": "2026-06-15T18:00:00Z",
  "position": 0,
  "created_at": "2026-06-09T04:25:00Z",
  "updated_at": "2026-06-09T04:25:00Z"
}
```

---

### Get Task Details
* **Method**: `GET`
* **Route**: `/tasks/{task_id}`
* **Authentication Requirement**: Bearer Token
* **Request Body**: None
* **Response Body (200 OK)**:
```json
{
  "id": "9b3e35a1-432d-4566-a3d5-1ff2506e7890",
  "column_id": "7f3e35a1-432d-4566-a3d5-1ff2506e789e",
  "title": "Build API Contracts Docs",
  "description": "Outline all schemas and routes for frontend teams",
  "priority": "HIGH",
  "assignee_id": "3b2e35a1-432d-4566-a3d5-1ff2506e789a",
  "reporter_id": "3b2e35a1-432d-4566-a3d5-1ff2506e789a",
  "due_date": "2026-06-15T18:00:00Z",
  "position": 0,
  "created_at": "2026-06-09T04:25:00Z",
  "updated_at": "2026-06-09T04:25:00Z"
}
```

---

### Update Task
* **Method**: `PATCH`
* **Route**: `/tasks/{task_id}`
* **Authentication Requirement**: Bearer Token
* **Request Body**:
```json
{
  "title": "Updated Task Title",
  "description": "Updated description text",
  "priority": "CRITICAL",
  "assignee_id": "3b2e35a1-432d-4566-a3d5-1ff2506e789a",
  "reporter_id": "3b2e35a1-432d-4566-a3d5-1ff2506e789a",
  "due_date": "2026-06-20T12:00:00Z"
}
```
* **Response Body (200 OK)**:
```json
{
  "id": "9b3e35a1-432d-4566-a3d5-1ff2506e7890",
  "column_id": "7f3e35a1-432d-4566-a3d5-1ff2506e789e",
  "title": "Updated Task Title",
  "description": "Updated description text",
  "priority": "CRITICAL",
  "assignee_id": "3b2e35a1-432d-4566-a3d5-1ff2506e789a",
  "reporter_id": "3b2e35a1-432d-4566-a3d5-1ff2506e789a",
  "due_date": "2026-06-20T12:00:00Z",
  "position": 0,
  "created_at": "2026-06-09T04:25:00Z",
  "updated_at": "2026-06-09T04:30:00Z"
}
```

---

### Move Task (Drag-and-Drop)
* **Method**: `POST`
* **Route**: `/tasks/{task_id}/move`
* **Authentication Requirement**: Bearer Token
* **Request Body**:
```json
{
  "column_id": "8a3e35a1-432d-4566-a3d5-1ff2506e789f",
  "position": 1
}
```
* **Response Body (200 OK)**:
```json
{
  "id": "9b3e35a1-432d-4566-a3d5-1ff2506e7890",
  "column_id": "8a3e35a1-432d-4566-a3d5-1ff2506e789f",
  "title": "Updated Task Title",
  "description": "Updated description text",
  "priority": "CRITICAL",
  "assignee_id": "3b2e35a1-432d-4566-a3d5-1ff2506e789a",
  "reporter_id": "3b2e35a1-432d-4566-a3d5-1ff2506e789a",
  "due_date": "2026-06-20T12:00:00Z",
  "position": 1,
  "created_at": "2026-06-09T04:25:00Z",
  "updated_at": "2026-06-09T04:32:00Z"
}
```

---

### Assign Task (Direct)
* **Method**: `POST`
* **Route**: `/tasks/{task_id}/assign`
* **Authentication Requirement**: Bearer Token
* **Request Body**:
```json
{
  "assignee_id": "3b2e35a1-432d-4566-a3d5-1ff2506e789a" // Set to null to unassign
}
```
* **Response Body (200 OK)**:
```json
{
  "id": "9b3e35a1-432d-4566-a3d5-1ff2506e7890",
  "column_id": "8a3e35a1-432d-4566-a3d5-1ff2506e789f",
  "title": "Updated Task Title",
  "description": "Updated description text",
  "priority": "CRITICAL",
  "assignee_id": "3b2e35a1-432d-4566-a3d5-1ff2506e789a",
  "reporter_id": "3b2e35a1-432d-4566-a3d5-1ff2506e789a",
  "due_date": "2026-06-20T12:00:00Z",
  "position": 1,
  "created_at": "2026-06-09T04:25:00Z",
  "updated_at": "2026-06-09T04:33:00Z"
}
```

---

### Reorder Tasks inside Column
* **Method**: `POST`
* **Route**: `/tasks/reorder`
* **Authentication Requirement**: Bearer Token
* **Query Parameters**:
  * `column_id` (UUID, Required)
* **Request Body**:
```json
{
  "column_id": "8a3e35a1-432d-4566-a3d5-1ff2506e789f",
  "ordered_ids": [
    "9b3e35a1-432d-4566-a3d5-1ff2506e7890",
    "0c3e35a1-432d-4566-a3d5-1ff2506e7891"
  ]
}
```
* **Response (204 No Content)**: Empty Body

---

### Delete Task
* **Method**: `DELETE`
* **Route**: `/tasks/{task_id}`
* **Authentication Requirement**: Bearer Token
* **Request Body**: None
* **Response (204 No Content)**: Empty Body

---

## 7. Comments Module

### Create Comment
* **Method**: `POST`
* **Route**: `/comments`
* **Authentication Requirement**: Bearer Token
* **Request Body**:
```json
{
  "task_id": "9b3e35a1-432d-4566-a3d5-1ff2506e7890",
  "content": "Finished implementing the auth flow. Please review @alex."
}
```
* **Response Body (201 Created)**:
```json
{
  "id": "1c3e35a1-432d-4566-a3d5-1ff2506e7892",
  "task_id": "9b3e35a1-432d-4566-a3d5-1ff2506e7890",
  "author_id": "3b2e35a1-432d-4566-a3d5-1ff2506e789a",
  "content": "Finished implementing the auth flow. Please review @alex.",
  "created_at": "2026-06-09T04:40:00Z",
  "updated_at": "2026-06-09T04:40:00Z"
}
```

---

### List Task Comments
* **Method**: `GET`
* **Route**: `/comments/task/{task_id}`
* **Authentication Requirement**: Bearer Token
* **Request Body**: None
* **Response Body (200 OK)**:
```json
[
  {
    "id": "1c3e35a1-432d-4566-a3d5-1ff2506e7892",
    "task_id": "9b3e35a1-432d-4566-a3d5-1ff2506e7890",
    "author_id": "3b2e35a1-432d-4566-a3d5-1ff2506e789a",
    "content": "Finished implementing the auth flow. Please review @alex.",
    "created_at": "2026-06-09T04:40:00Z",
    "updated_at": "2026-06-09T04:40:00Z"
  }
]
```

---

### Edit Comment
* **Method**: `PATCH`
* **Route**: `/comments/{comment_id}`
* **Authentication Requirement**: Bearer Token (Author only)
* **Request Body**:
```json
{
  "content": "Edited comment content text"
}
```
* **Response Body (200 OK)**:
```json
{
  "id": "1c3e35a1-432d-4566-a3d5-1ff2506e7892",
  "task_id": "9b3e35a1-432d-4566-a3d5-1ff2506e7890",
  "author_id": "3b2e35a1-432d-4566-a3d5-1ff2506e789a",
  "content": "Edited comment content text",
  "created_at": "2026-06-09T04:40:00Z",
  "updated_at": "2026-06-09T04:45:00Z"
}
```

---

### Delete Comment
* **Method**: `DELETE`
* **Route**: `/comments/{comment_id}`
* **Authentication Requirement**: Bearer Token (Author or Workspace Admin/Owner only)
* **Request Body**: None
* **Response (204 No Content)**: Empty Body

---

## 8. Activity Logs Module

### Get Workspace Activity timeline
* **Method**: `GET`
* **Route**: `/activity-logs/workspace/{workspace_id}`
* **Authentication Requirement**: Bearer Token
* **Query Parameters**:
  * `limit` (Integer, Default: `50`, Max: `100`)
  * `offset` (Integer, Default: `0`)
* **Request Body**: None
* **Response Body (200 OK)**:
```json
[
  {
    "id": "2d3e35a1-432d-4566-a3d5-1ff2506e7893",
    "workspace_id": "4c3e35a1-432d-4566-a3d5-1ff2506e789b",
    "actor_id": "3b2e35a1-432d-4566-a3d5-1ff2506e789a",
    "entity_type": "TASK",
    "entity_id": "9b3e35a1-432d-4566-a3d5-1ff2506e7890",
    "action": "TASK_CREATED",
    "metadata": {
      "title": "Build API Contracts Docs"
    },
    "created_at": "2026-06-09T04:25:00Z"
  }
]
```

---

### Get Entity Activity timeline
* **Method**: `GET`
* **Route**: `/activity-logs/entity/{entity_type}/{entity_id}`
* **Authentication Requirement**: Bearer Token
* **Query Parameters**:
  * `limit` (Integer, Default: `50`, Max: `100`)
  * `offset` (Integer, Default: `0`)
* **Request Body**: None
* **Response Body (200 OK)**:
```json
[
  {
    "id": "2d3e35a1-432d-4566-a3d5-1ff2506e7893",
    "workspace_id": "4c3e35a1-432d-4566-a3d5-1ff2506e789b",
    "actor_id": "3b2e35a1-432d-4566-a3d5-1ff2506e789a",
    "entity_type": "TASK",
    "entity_id": "9b3e35a1-432d-4566-a3d5-1ff2506e7890",
    "action": "TASK_CREATED",
    "metadata": {
      "title": "Build API Contracts Docs"
    },
    "created_at": "2026-06-09T04:25:00Z"
  }
]
```

---

## 9. Notifications Module

### List Notifications
* **Method**: `GET`
* **Route**: `/notifications`
* **Authentication Requirement**: Bearer Token
* **Query Parameters**:
  * `is_read` (Boolean, Optional, e.g. `is_read=false`)
  * `limit` (Integer, Default: `20`, Max: `100`)
  * `offset` (Integer, Default: `0`)
* **Request Body**: None
* **Response Body (200 OK)**:
```json
[
  {
    "id": "3e3e35a1-432d-4566-a3d5-1ff2506e7894",
    "user_id": "3b2e35a1-432d-4566-a3d5-1ff2506e789a",
    "type": "TASK_ASSIGNED",
    "title": "New Task Assignment",
    "body": "You have been assigned to task: Build API Contracts Docs",
    "payload": {
      "task_id": "9b3e35a1-432d-4566-a3d5-1ff2506e7890"
    },
    "is_read": false,
    "read_at": null,
    "created_at": "2026-06-09T04:33:00Z"
  }
]
```

---

### Mark Notification as Read
* **Method**: `PATCH`
* **Route**: `/notifications/{notification_id}/read`
* **Authentication Requirement**: Bearer Token
* **Request Body**: None
* **Response (204 No Content)**: Empty Body

---

### Mark All Notifications as Read
* **Method**: `PATCH`
* **Route**: `/notifications/read-all`
* **Authentication Requirement**: Bearer Token
* **Request Body**: None
* **Response (204 No Content)**: Empty Body

---

## 10. Health Check Module

### Check System Status
* **Method**: `GET`
* **Route**: `/health`
* **Authentication Requirement**: None
* **Request Body**: None
* **Response Body (200 OK)**:
```json
{
  "status": "healthy",
  "app": "project-management-system",
  "environment": "development"
}
```
