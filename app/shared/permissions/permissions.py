import enum


class Permission(str, enum.Enum):
    # Workspace permissions
    WORKSPACE_VIEW = "workspace:view"
    WORKSPACE_UPDATE = "workspace:update"
    WORKSPACE_DELETE = "workspace:delete"
    WORKSPACE_TRANSFER_OWNERSHIP = "workspace:transfer_ownership"
    WORKSPACE_VIEW_MEMBERS = "workspace:view_members"
    WORKSPACE_INVITE_MEMBERS = "workspace:invite_members"
    WORKSPACE_REMOVE_MEMBERS = "workspace:remove_members"
    WORKSPACE_CHANGE_ROLE = "workspace:change_role"

    # Project permissions
    PROJECT_VIEW = "project:view"
    PROJECT_CREATE = "project:create"
    PROJECT_UPDATE = "project:update"
    PROJECT_ARCHIVE = "project:archive"
    PROJECT_DELETE = "project:delete"

    # Board permissions
    BOARD_VIEW = "board:view"
    BOARD_CREATE = "board:create"
    BOARD_RENAME = "board:rename"
    BOARD_DELETE = "board:delete"

    # Column permissions
    COLUMN_VIEW = "column:view"
    COLUMN_CREATE = "column:create"
    COLUMN_RENAME = "column:rename"
    COLUMN_DELETE = "column:delete"
    COLUMN_REORDER = "column:reorder"

    # Task permissions
    TASK_VIEW = "task:view"
    TASK_CREATE = "task:create"
    TASK_EDIT = "task:edit"
    TASK_DELETE_OWN = "task:delete_own"
    TASK_DELETE_ANY = "task:delete_any"
    TASK_MOVE = "task:move"
    TASK_ASSIGN = "task:assign"
    TASK_CHANGE_PRIORITY = "task:change_priority"
    TASK_SET_DUE_DATE = "task:set_due_date"

    # Comment permissions
    COMMENT_CREATE = "comment:create"
    COMMENT_EDIT_OWN = "comment:edit_own"
    COMMENT_DELETE_OWN = "comment:delete_own"
    COMMENT_DELETE_ANY = "comment:delete_any"

    # Mention permissions
    MENTION_USER = "mention:user"

    # Notification permissions
    NOTIFICATION_VIEW = "notification:view"
    NOTIFICATION_MARK_READ = "notification:mark_read"
    NOTIFICATION_DELETE = "notification:delete"

    # Activity feed permissions
    ACTIVITY_VIEW = "activity:view"
