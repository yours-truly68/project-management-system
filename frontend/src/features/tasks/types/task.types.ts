export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface Task {
  id: string;
  column_id: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  assignee_id: string | null;
  reporter_id: string | null;
  due_date: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface TaskCreateInput {
  column_id: string;
  title: string;
  description?: string | null;
  priority?: TaskPriority;
  assignee_id?: string | null;
  reporter_id?: string | null;
  due_date?: string | null;
  position: number;
}

export interface TaskUpdateInput {
  title?: string;
  description?: string | null;
  priority?: TaskPriority;
  assignee_id?: string | null;
  reporter_id?: string | null;
  due_date?: string | null;
}

export interface TaskMoveInput {
  column_id: string;
  position: number;
}
