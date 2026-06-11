import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { workspaceService } from "../services/workspace.service";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { WorkspaceUpdateInput } from "../types/workspace.types";

export function useWorkspaces() {
  const { activeWorkspaceId, setActiveWorkspaceId } = useWorkspaceStore();

  const query = useQuery({
    queryKey: ["workspaces"],
    queryFn: workspaceService.listWorkspaces,
  });

  const workspaces = query.data;

  const activeWorkspace = workspaces?.find((w) => w.id === activeWorkspaceId) || null;

  return {
    ...query,
    workspaces: workspaces || [],
    activeWorkspace,
    activeWorkspaceId,
    setActiveWorkspaceId,
  };
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  const { setActiveWorkspaceId } = useWorkspaceStore();

  return useMutation({
    mutationFn: workspaceService.createWorkspace,
    onSuccess: (newWorkspace) => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      setActiveWorkspaceId(newWorkspace.id);
    },
  });
}

export function useUpdateWorkspace(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: WorkspaceUpdateInput) =>
      workspaceService.updateWorkspace(workspaceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["workspace", workspaceId] });
    },
  });
}

export function useDeleteWorkspace() {
  const queryClient = useQueryClient();
  const { setActiveWorkspaceId } = useWorkspaceStore();

  return useMutation({
    mutationFn: workspaceService.deleteWorkspace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      setActiveWorkspaceId(null);
    },
  });
}
