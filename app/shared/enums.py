"""
Domain enums shared across feature modules.

Defined centrally in app/shared to avoid circular imports between
feature packages that reference each other's enums.
"""

import enum


class AuthProvider(str, enum.Enum):
    EMAIL = "EMAIL"
    GOOGLE = "GOOGLE"
    GITHUB = "GITHUB"


class WorkspaceRole(str, enum.Enum):
    OWNER = "OWNER"
    ADMIN = "ADMIN"
    MEMBER = "MEMBER"


class Priority(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    URGENT = "URGENT"


class NotificationType(str, enum.Enum):
    TASK_ASSIGNED = "TASK_ASSIGNED"
    TASK_MENTIONED = "TASK_MENTIONED"
    TASK_DUE_SOON = "TASK_DUE_SOON"
    TASK_OVERDUE = "TASK_OVERDUE"
    PROJECT_INVITATION = "PROJECT_INVITATION"
    COMMENT_ADDED = "COMMENT_ADDED"


class ActivityType(str, enum.Enum):
    TASK_CREATED = "TASK_CREATED"
    TASK_UPDATED = "TASK_UPDATED"
    TASK_DELETED = "TASK_DELETED"
    TASK_MOVED = "TASK_MOVED"
    PROJECT_CREATED = "PROJECT_CREATED"
    PROJECT_UPDATED = "PROJECT_UPDATED"
    PROJECT_ARCHIVED = "PROJECT_ARCHIVED"
    COMMENT_CREATED = "COMMENT_CREATED"


class ActivityAction(str, enum.Enum):
    TASK_CREATED = "TASK_CREATED"
    TASK_DELETED = "TASK_DELETED"
    TASK_ASSIGNED = "TASK_ASSIGNED"
    TASK_UNASSIGNED = "TASK_UNASSIGNED"
    TASK_PRIORITY_CHANGED = "TASK_PRIORITY_CHANGED"
    TASK_DUE_DATE_CHANGED = "TASK_DUE_DATE_CHANGED"
    TASK_MOVED = "TASK_MOVED"
    COLUMN_CREATED = "COLUMN_CREATED"
    COLUMN_DELETED = "COLUMN_DELETED"
    PROJECT_CREATED = "PROJECT_CREATED"
    PROJECT_ARCHIVED = "PROJECT_ARCHIVED"
    PROJECT_RESTORED = "PROJECT_RESTORED"

