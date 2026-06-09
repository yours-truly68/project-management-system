import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { workspaceService } from "../services/workspace.service";
import { WorkspaceRole } from "../types/workspace.types";

export function useWorkspaceMembers(workspaceId: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["workspace-members", workspaceId],
    queryFn: () =>
      workspaceId ? workspaceService.listMembers(workspaceId) : Promise.resolve([]),
    enabled: !!workspaceId,
  });

  const inviteMutation = useMutation({
    mutationFn: (data: { email: string; role: WorkspaceRole }) =>
      workspaceId
        ? workspaceService.inviteMember(workspaceId, data)
        : Promise.reject("No workspace selected"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace-members", workspaceId] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (userId: string) =>
      workspaceId
        ? workspaceService.removeMember(workspaceId, userId)
        : Promise.reject("No workspace selected"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace-members", workspaceId] });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: WorkspaceRole }) =>
      workspaceId
        ? workspaceService.updateMemberRole(workspaceId, userId, role)
        : Promise.reject("No workspace selected"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace-members", workspaceId] });
    },
  });

  return {
    ...query,
    members: query.data || [],
    inviteMember: inviteMutation.mutateAsync,
    isInviting: inviteMutation.isPending,
    inviteError: inviteMutation.error,
    removeMember: removeMutation.mutateAsync,
    isRemoving: removeMutation.isPending,
    updateRole: updateRoleMutation.mutateAsync,
    isUpdatingRole: updateRoleMutation.isPending,
  };
}
export default useWorkspaceMembers;
