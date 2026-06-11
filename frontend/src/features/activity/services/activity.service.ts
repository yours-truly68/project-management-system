import { apiClient } from "@/lib/api/client";
import { Activity } from "../types/activity.types";

export const activityService = {
  async getActivityFeed(
    workspaceId: string,
    projectId?: string | null,
    boardId?: string | null
  ): Promise<Activity[]> {
    const params: Record<string, string> = { workspace_id: workspaceId };
    if (projectId) params.project_id = projectId;
    if (boardId) params.board_id = boardId;

    const response = await apiClient.get<Activity[]>("/activities/", { params });
    return response.data;
  },
};

export default activityService;
