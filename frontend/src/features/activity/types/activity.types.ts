export type ActivityAction =
  | "TASK_CREATED"
  | "TASK_DELETED"
  | "TASK_ASSIGNED"
  | "TASK_UNASSIGNED"
  | "TASK_PRIORITY_CHANGED"
  | "TASK_DUE_DATE_CHANGED"
  | "TASK_MOVED"
  | "COLUMN_CREATED"
  | "COLUMN_DELETED"
  | "PROJECT_CREATED"
  | "PROJECT_ARCHIVED"
  | "PROJECT_RESTORED";

export interface ActivityMetadata {
  task_title?: string;
  column_name?: string;
  project_name?: string;
  assignee_name?: string;
  from_priority?: string;
  to_priority?: string;
  from_column?: string;
  to_column?: string;
  from_due_date?: string | null;
  to_due_date?: string | null;
  [key: string]: any;
}

export interface Activity {
  id: string;
  workspace_id: string;
  project_id: string | null;
  board_id: string | null;
  task_id: string | null;
  actor_id: string;
  action: ActivityAction;
  metadata: ActivityMetadata | null;
  created_at: string;
  actor: {
    id: string;
    email: string;
    username: string;
    full_name: string;
    avatar_url: string | null;
  } | null;
}
