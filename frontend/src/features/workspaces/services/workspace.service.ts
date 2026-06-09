import { apiClient } from "@/lib/api/client";
import {
  Workspace,
  WorkspaceMemberDetailed,
  WorkspaceCreateInput,
  WorkspaceUpdateInput,
  WorkspaceRole,
} from "../types/workspace.types";

export const workspaceService = {
  async listWorkspaces(): Promise<Workspace[]> {
    const response = await apiClient.get<Workspace[]>("/workspaces/");
    return response.data;
  },

  async getWorkspace(id: string): Promise<Workspace> {
    const response = await apiClient.get<Workspace>(`/workspaces/${id}`);
    return response.data;
  },

  async createWorkspace(data: WorkspaceCreateInput): Promise<Workspace> {
    const response = await apiClient.post<Workspace>("/workspaces/", data);
    return response.data;
  },

  async updateWorkspace(id: string, data: WorkspaceUpdateInput): Promise<Workspace> {
    const response = await apiClient.patch<Workspace>(`/workspaces/${id}`, data);
    return response.data;
  },

  async deleteWorkspace(id: string): Promise<void> {
    await apiClient.delete(`/workspaces/${id}`);
  },

  async listMembers(workspaceId: string): Promise<WorkspaceMemberDetailed[]> {
    const response = await apiClient.get<WorkspaceMemberDetailed[]>(
      `/workspaces/${workspaceId}/members`
    );
    return response.data;
  },

  async inviteMember(
    workspaceId: string,
    data: { email: string; role: WorkspaceRole }
  ): Promise<void> {
    await apiClient.post(`/workspaces/${workspaceId}/members`, data);
  },

  async removeMember(workspaceId: string, userId: string): Promise<void> {
    await apiClient.delete(`/workspaces/${workspaceId}/members/${userId}`);
  },

  async updateMemberRole(
    workspaceId: string,
    userId: string,
    role: WorkspaceRole
  ): Promise<void> {
    await apiClient.patch(`/workspaces/${workspaceId}/members/${userId}`, { role });
  },
};

export default workspaceService;
