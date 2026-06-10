import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectService } from "../services/project.service";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { useProjectStore, getCookie } from "@/stores/project.store";
import { useEffect } from "react";
import { ProjectUpdateInput } from "../types/project.types";

export function useProjects(includeArchived: boolean = false) {
  const { activeWorkspaceId } = useWorkspaceStore();
  const { activeProjectId, setActiveProjectId, archivedEntity, setArchivedEntity } = useProjectStore();

  const query = useQuery({
    queryKey: ["projects", activeWorkspaceId, includeArchived],
    queryFn: () => projectService.listProjects(activeWorkspaceId!, includeArchived),
    enabled: !!activeWorkspaceId,
  });

  const projects = query.data;

  // Clear archivedEntity when workspace changes
  useEffect(() => {
    setArchivedEntity(null);
  }, [activeWorkspaceId, setArchivedEntity]);

  // Load initial project ID from cookie on client-side mount
  useEffect(() => {
    const savedId = getCookie("kando_active_project");
    if (savedId && !activeProjectId) {
      setActiveProjectId(savedId);
    }
  }, [setActiveProjectId, activeProjectId]);

  // Query details of activeProjectId separately if it's not in the active projects list, to check if it's archived
  const activeProjectQuery = useQuery({
    queryKey: ["project", activeProjectId],
    queryFn: () => projectService.getProject(activeProjectId!),
    enabled: !!activeProjectId && projects !== undefined && !projects.some((p) => p.id === activeProjectId),
    retry: false,
  });

  // Watch the active project query to detect if it has been archived
  useEffect(() => {
    if (activeProjectQuery.data && activeProjectQuery.data.archived_at) {
      const pName = activeProjectQuery.data.name;
      // It is archived! Clear active project and board, set archived entity
      setActiveProjectId(null);
      import("@/stores/board.store").then((mod) => {
        mod.useBoardStore.getState().setActiveBoardId(null);
      });
      setArchivedEntity({
        id: activeProjectQuery.data.id,
        type: "project",
        name: pName,
      });
    }
  }, [activeProjectQuery.data, setActiveProjectId, setArchivedEntity]);

  // Sync activeProjectId with available projects
  useEffect(() => {
    if (archivedEntity) {
      return; // Do not auto-select if active entity is archived
    }
    if (!includeArchived && projects && projects.length > 0) {
      const hasCookie = getCookie("kando_active_project");
      if (hasCookie && !activeProjectId && projects.some((p) => p.id === hasCookie)) {
        return; // wait for the mount effect to restore it
      }
      const exists = projects.some((p) => p.id === activeProjectId);
      if (!activeProjectId || !exists) {
        // Only auto-select if we aren't waiting to check if the active project was archived
        const isLoadingOrChecking = activeProjectId && activeProjectQuery.isLoading;
        if (!isLoadingOrChecking) {
          // If the project doesn't exist or is error, auto-select first active project
          if (!activeProjectId || activeProjectQuery.isError || (activeProjectQuery.data && !activeProjectQuery.data.archived_at)) {
            setActiveProjectId(projects[0].id);
          }
        }
      }
    } else if (!includeArchived && projects && projects.length === 0) {
      setActiveProjectId(null);
    }
  }, [projects, activeProjectId, setActiveProjectId, includeArchived, activeProjectQuery.data, activeProjectQuery.isError, activeProjectQuery.isLoading, archivedEntity]);

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
