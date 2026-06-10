export interface Project {
  id: string;
  workspace_id: string;
  name: string;
  key: string;
  description: string | null;
  created_by: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjectCreateInput {
  workspace_id: string;
  name: string;
  key: string;
  description?: string;
}

export interface ProjectUpdateInput {
  name?: string;
  key?: string;
  description?: string | null;
  is_archived?: boolean;
}
