export interface Board {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface BoardCreateInput {
  project_id: string;
  name: string;
  description?: string;
}

export interface BoardUpdateInput {
  name?: string;
  description?: string | null;
}
