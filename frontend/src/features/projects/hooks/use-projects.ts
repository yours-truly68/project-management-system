import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectService } from "../services/project.service";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { useProjectStore } from "@/stores/project.store";
import { ProjectUpdateInput } from "../types/project.types";

export function useProjects(includeArchived: boolean = false) {
  const { activeWorkspaceId } = useWorkspaceStore();
  const { activeProjectId, setActiveProjectId } = useProjectStore();

  const query = useQuery({
    queryKey: ["projects", activeWorkspaceId, includeArchived],
    queryFn: () => projectService.listProjects(activeWorkspaceId!, includeArchived),
    enabled: !!activeWorkspaceId,
  });

  const projects = query.data;
  const activeProject = projects?.find((p) => p.id === activeProjectId) || null;

  return {
    ...query,
    projects: projects || [],
    activeProject,
    activeProjectId,
    setActiveProjectId,
  };
}


export function useProject(id: string | null) {
  return useQuery({
    queryKey: ["project", id],
    queryFn: () => projectService.getProject(id!),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const { activeWorkspaceId } = useWorkspaceStore();
  const { setActiveProjectId } = useProjectStore();

  return useMutation({
    mutationFn: projectService.createProject,
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: ["projects", activeWorkspaceId] });
      setActiveProjectId(newProject.id);
    },
  });
}

export function useUpdateProject(projectId: string) {
  const queryClient = useQueryClient();
  const { activeWorkspaceId } = useWorkspaceStore();

  return useMutation({
    mutationFn: (data: ProjectUpdateInput) =>
      projectService.updateProject(projectId, data),
    onSuccess: (updatedProject) => {
      queryClient.setQueryData(["project", projectId], updatedProject);
      queryClient.invalidateQueries({ queryKey: ["projects", activeWorkspaceId] });
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  const { activeWorkspaceId } = useWorkspaceStore();
  const { setActiveProjectId } = useProjectStore();

  return useMutation({
    mutationFn: projectService.deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", activeWorkspaceId] });
      setActiveProjectId(null);
    },
  });
}
