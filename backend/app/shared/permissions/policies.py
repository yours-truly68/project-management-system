from app.shared.enums import WorkspaceRole
from app.shared.permissions.permissions import Permission

# Matrix maps Roles to their allowed permissions
ROLE_PERMISSIONS: dict[WorkspaceRole, set[Permission]] = {
    WorkspaceRole.OWNER: {
        # Workspace
        Permission.WORKSPACE_VIEW,
        Permission.WORKSPACE_UPDATE,
        Permission.WORKSPACE_DELETE,
        Permission.WORKSPACE_TRANSFER_OWNERSHIP,
        Permission.WORKSPACE_VIEW_MEMBERS,
        Permission.WORKSPACE_INVITE_MEMBERS,
        Permission.WORKSPACE_REMOVE_MEMBERS,
        Permission.WORKSPACE_CHANGE_ROLE,
        # Project
        Permission.PROJECT_VIEW,
        Permission.PROJECT_CREATE,
        Permission.PROJECT_UPDATE,
        Permission.PROJECT_ARCHIVE,
        Permission.PROJECT_DELETE,
        # Board
        Permission.BOARD_VIEW,
        Permission.BOARD_CREATE,
        Permission.BOARD_RENAME,
        Permission.BOARD_DELETE,
        # Column
        Permission.COLUMN_VIEW,
        Permission.COLUMN_CREATE,
        Permission.COLUMN_RENAME,
        Permission.COLUMN_DELETE,
        Permission.COLUMN_REORDER,
        # Task
        Permission.TASK_VIEW,
        Permission.TASK_CREATE,
        Permission.TASK_EDIT,
        Permission.TASK_DELETE_OWN,
        Permission.TASK_DELETE_ANY,
        Permission.TASK_MOVE,
        Permission.TASK_ASSIGN,
        Permission.TASK_CHANGE_PRIORITY,
        Permission.TASK_SET_DUE_DATE,
        # Comment
        Permission.COMMENT_CREATE,
        Permission.COMMENT_EDIT_OWN,
        Permission.COMMENT_DELETE_OWN,
        Permission.COMMENT_DELETE_ANY,
        # Mention
        Permission.MENTION_USER,
        # Notification
        Permission.NOTIFICATION_VIEW,
        Permission.NOTIFICATION_MARK_READ,
        Permission.NOTIFICATION_DELETE,
        # Activity
        Permission.ACTIVITY_VIEW,
    },
    WorkspaceRole.ADMIN: {
        # Workspace
        Permission.WORKSPACE_VIEW,
        Permission.WORKSPACE_UPDATE,
        Permission.WORKSPACE_VIEW_MEMBERS,
        Permission.WORKSPACE_INVITE_MEMBERS,
        Permission.WORKSPACE_REMOVE_MEMBERS,
        Permission.WORKSPACE_CHANGE_ROLE,
        # Project
        Permission.PROJECT_VIEW,
        Permission.PROJECT_CREATE,
        Permission.PROJECT_UPDATE,
        Permission.PROJECT_ARCHIVE,
        # Board
        Permission.BOARD_VIEW,
        Permission.BOARD_CREATE,
        Permission.BOARD_RENAME,
        Permission.BOARD_DELETE,
        # Column
        Permission.COLUMN_VIEW,
        Permission.COLUMN_CREATE,
        Permission.COLUMN_RENAME,
        Permission.COLUMN_DELETE,
        Permission.COLUMN_REORDER,
        # Task
        Permission.TASK_VIEW,
        Permission.TASK_CREATE,
        Permission.TASK_EDIT,
        Permission.TASK_DELETE_OWN,
        Permission.TASK_DELETE_ANY,
        Permission.TASK_MOVE,
        Permission.TASK_ASSIGN,
        Permission.TASK_CHANGE_PRIORITY,
        Permission.TASK_SET_DUE_DATE,
        # Comment
        Permission.COMMENT_CREATE,
        Permission.COMMENT_EDIT_OWN,
        Permission.COMMENT_DELETE_OWN,
        Permission.COMMENT_DELETE_ANY,
        # Mention
        Permission.MENTION_USER,
        # Notification
        Permission.NOTIFICATION_VIEW,
        Permission.NOTIFICATION_MARK_READ,
        Permission.NOTIFICATION_DELETE,
        # Activity
        Permission.ACTIVITY_VIEW,
    },
    WorkspaceRole.MEMBER: {
        # Workspace
        Permission.WORKSPACE_VIEW,
        Permission.WORKSPACE_VIEW_MEMBERS,
        # Project
        Permission.PROJECT_VIEW,
        # Board
        Permission.BOARD_VIEW,
        # Column
        Permission.COLUMN_VIEW,
        # Task
        Permission.TASK_VIEW,
        Permission.TASK_CREATE,
        Permission.TASK_EDIT,
        Permission.TASK_DELETE_OWN,
        Permission.TASK_MOVE,
        Permission.TASK_ASSIGN,
        Permission.TASK_CHANGE_PRIORITY,
        Permission.TASK_SET_DUE_DATE,
        # Comment
        Permission.COMMENT_CREATE,
        Permission.COMMENT_EDIT_OWN,
        Permission.COMMENT_DELETE_OWN,
        # Mention
        Permission.MENTION_USER,
        # Notification
        Permission.NOTIFICATION_VIEW,
        Permission.NOTIFICATION_MARK_READ,
        Permission.NOTIFICATION_DELETE,
        # Activity
        Permission.ACTIVITY_VIEW,
    },
}


def has_permission(
    role: WorkspaceRole,
    permission: Permission,
    is_resource_creator: bool = False,
) -> bool:
    """
    Check if a user with a given WorkspaceRole has access to a specific Permission.

    Example usages:
        # Standard check
        if not has_permission(role, Permission.PROJECT_CREATE):
            raise ForbiddenException()

        # Contextual check (deleting a task)
        is_creator = current_user.id == task.created_by
        can_delete = (
            has_permission(role, Permission.TASK_DELETE_ANY)
            or (is_creator and has_permission(role, Permission.TASK_DELETE_OWN))
        )
        if not can_delete:
            raise ForbiddenException()
    """
    allowed_permissions = ROLE_PERMISSIONS.get(role, set())

    # If the action is specifically restricted to "own" items, check ownership context
    if permission in {
        Permission.TASK_DELETE_OWN,
        Permission.COMMENT_EDIT_OWN,
        Permission.COMMENT_DELETE_OWN,
    }:
        return is_resource_creator and permission in allowed_permissions

    return permission in allowed_permissions
