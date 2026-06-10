import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectService } from "../services/project.service";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { useProjectStore, getCookie } from "@/stores/project.store";
import { useEffect } from "react";
import { ProjectUpdateInput } from "../types/project.types";

export function useProjects() {
  const { activeWorkspaceId } = useWorkspaceStore();
  const { activeProjectId, setActiveProjectId } = useProjectStore();

  const query = useQuery({
    queryKey: ["projects", activeWorkspaceId],
    queryFn: () => projectService.listProjects(activeWorkspaceId!),
    enabled: !!activeWorkspaceId,
  });

  const projects = query.data;

  // Load initial project ID from cookie on client-side mount
  useEffect(() => {
    const savedId = getCookie("kando_active_project");
    if (savedId && !activeProjectId) {
      setActiveProjectId(savedId);
    }
  }, [setActiveProjectId, activeProjectId]);

  // Sync activeProjectId with available projects
  useEffect(() => {
    if (projects && projects.length > 0) {
      const hasCookie = getCookie("kando_active_project");
      if (hasCookie && !activeProjectId && projects.some((p) => p.id === hasCookie)) {
        return; // wait for the mount effect to restore it
      }
      const exists = projects.some((p) => p.id === activeProjectId);
      if (!activeProjectId || !exists) {
        setActiveProjectId(projects[0].id);
      }
    } else if (projects && projects.length === 0) {
      setActiveProjectId(null);
    }
  }, [projects, activeProjectId, setActiveProjectId]);

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
    onSuccess: () => {
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
