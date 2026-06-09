# PERMISSIONS_MATRIX.md

## Purpose

This document defines authorization rules for the Project Management System.

It acts as the source of truth for:

* Backend Authorization
* API Security
* Service Layer Validation
* UI Visibility Rules

Any permission changes must be reflected here first.

---

# Workspace Roles

## OWNER

Highest level role.

Capabilities:

* Full workspace control
* Transfer ownership
* Delete workspace

---

## ADMIN

Workspace manager.

Capabilities:

* Manage projects
* Manage members
* Manage boards
* Manage tasks

Cannot:

* Delete workspace
* Transfer ownership

---

## MEMBER

Regular workspace participant.

Capabilities:

* Work on assigned tasks
* Create tasks
* Comment
* Collaborate

Cannot:

* Manage workspace settings
* Manage members

---

# Permission Matrix

## Workspace Permissions

| Action             | Owner | Admin | Member |
| ------------------ | ----- | ----- | ------ |
| View Workspace     | ✅     | ✅     | ✅      |
| Update Workspace   | ✅     | ✅     | ❌      |
| Delete Workspace   | ✅     | ❌     | ❌      |
| Transfer Ownership | ✅     | ❌     | ❌      |
| View Members       | ✅     | ✅     | ✅      |
| Invite Members     | ✅     | ✅     | ❌      |
| Remove Members     | ✅     | ✅     | ❌      |
| Change Member Role | ✅     | ✅     | ❌      |

---

## Project Permissions

| Action          | Owner | Admin | Member |
| --------------- | ----- | ----- | ------ |
| View Project    | ✅     | ✅     | ✅      |
| Create Project  | ✅     | ✅     | ❌      |
| Update Project  | ✅     | ✅     | ❌      |
| Archive Project | ✅     | ✅     | ❌      |
| Delete Project  | ✅     | ❌     | ❌      |

---

## Board Permissions

| Action       | Owner | Admin | Member |
| ------------ | ----- | ----- | ------ |
| View Board   | ✅     | ✅     | ✅      |
| Create Board | ✅     | ✅     | ❌      |
| Rename Board | ✅     | ✅     | ❌      |
| Delete Board | ✅     | ✅     | ❌      |

---

## Column Permissions

| Action          | Owner | Admin | Member |
| --------------- | ----- | ----- | ------ |
| View Column     | ✅     | ✅     | ✅      |
| Create Column   | ✅     | ✅     | ❌      |
| Rename Column   | ✅     | ✅     | ❌      |
| Delete Column   | ✅     | ✅     | ❌      |
| Reorder Columns | ✅     | ✅     | ❌      |

---

## Task Permissions

| Action          | Owner | Admin | Member |
| --------------- | ----- | ----- | ------ |
| View Task       | ✅     | ✅     | ✅      |
| Create Task     | ✅     | ✅     | ✅      |
| Edit Task       | ✅     | ✅     | ✅      |
| Delete Own Task | ✅     | ✅     | ✅      |
| Delete Any Task | ✅     | ✅     | ❌      |
| Move Task       | ✅     | ✅     | ✅      |
| Assign Task     | ✅     | ✅     | ✅      |
| Change Priority | ✅     | ✅     | ✅      |
| Set Due Date    | ✅     | ✅     | ✅      |

---

## Comment Permissions

| Action             | Owner | Admin | Member |
| ------------------ | ----- | ----- | ------ |
| Create Comment     | ✅     | ✅     | ✅      |
| Edit Own Comment   | ✅     | ✅     | ✅      |
| Delete Own Comment | ✅     | ✅     | ✅      |
| Delete Any Comment | ✅     | ✅     | ❌      |

---

## Mention Permissions

| Action       | Owner | Admin | Member |
| ------------ | ----- | ----- | ------ |
| Mention User | ✅     | ✅     | ✅      |

---

## Notification Permissions

| Action                  | Owner | Admin | Member |
| ----------------------- | ----- | ----- | ------ |
| View Own Notifications  | ✅     | ✅     | ✅      |
| Mark Notification Read  | ✅     | ✅     | ✅      |
| Delete Own Notification | ✅     | ✅     | ✅      |

---

## Activity Log Permissions

| Action               | Owner | Admin | Member |
| -------------------- | ----- | ----- | ------ |
| View Activity Feed   | ✅     | ✅     | ✅      |
| Delete Activity Logs | ❌     | ❌     | ❌      |

Activity logs are immutable.

---

# Ownership Rules

## Workspace Owner

There must always be exactly one workspace owner.

Restrictions:

* Workspace cannot exist without an owner.
* Ownership transfer is required before owner removal.
* Owner cannot remove themselves without transferring ownership.

---

# Task Ownership Rules

Task creator does not automatically gain elevated permissions.

Permissions are controlled by workspace role.

Example:

A MEMBER creates a task.

They can:

* Edit it
* Move it
* Delete their own task

They cannot:

* Delete tasks created by others

---

# Future Permission Expansion

Not part of V1.

Future releases may introduce:

```text
Custom Roles

Permission Groups

RBAC

Enterprise Permissions
```

Examples:

* Product Manager
* Designer
* QA Engineer
* Developer

These are intentionally excluded from V1.

---

# Authorization Strategy

Authorization must occur in:

```text
Router
❌ Never

Repository
❌ Never

Service Layer
✅ Always
```

Example:

```text
Router
↓
Service validates permissions
↓
Repository executes query
```

Business rules belong in services.

---

# Security Principle

Default behavior:

```text
Deny by Default
```

If permission is not explicitly granted:

```text
Access Denied
```

This matrix is the canonical source of truth for authorization throughout V1.
