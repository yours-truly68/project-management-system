import { apiClient } from "@/lib/api/client";
import {
  Project,
  ProjectCreateInput,
  ProjectUpdateInput,
} from "../types/project.types";

export const projectService = {
  async listProjects(
    workspaceId: string,
    includeArchived: boolean = false
  ): Promise<Project[]> {
    const response = await apiClient.get<Project[]>("/projects/", {
      params: {
        workspace_id: workspaceId,
        include_archived: includeArchived,
      },
    });
    return response.data;
  },

  async getProject(id: string): Promise<Project> {
    const response = await apiClient.get<Project>(`/projects/${id}`);
    return response.data;
  },

  async createProject(data: ProjectCreateInput): Promise<Project> {
    const response = await apiClient.post<Project>("/projects/", data);
    return response.data;
  },

  async updateProject(id: string, data: ProjectUpdateInput): Promise<Project> {
    const response = await apiClient.patch<Project>(`/projects/${id}`, data);
    return response.data;
  },

  async deleteProject(id: string): Promise<void> {
    await apiClient.delete(`/projects/${id}`);
  },
};

export default projectService;
