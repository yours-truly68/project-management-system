export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export type WorkspaceRole = "OWNER" | "ADMIN" | "MEMBER";

export interface WorkspaceMemberDetailed {
  id: string;
  user_id: string;
  role: WorkspaceRole;
  email: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  created_at: string;
}

export interface WorkspaceCreateInput {
  name: string;
  slug: string;
  description?: string;
}

export interface WorkspaceUpdateInput {
  name?: string;
  slug?: string;
  description?: string | null;
}
