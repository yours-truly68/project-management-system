import { useQuery } from "@tanstack/react-query";
import { activityService } from "../services/activity.service";
import { Activity } from "../types/activity.types";

export function useActivities(
  workspaceId: string | null,
  projectId?: string | null,
  boardId?: string | null
) {
  return useQuery<Activity[]>({
    queryKey: ["activities", workspaceId, projectId, boardId],
    queryFn: () => {
      if (!workspaceId) return [];
      return activityService.getActivityFeed(workspaceId, projectId, boardId);
    },
    enabled: !!workspaceId,
    staleTime: 5000,
  });
}
