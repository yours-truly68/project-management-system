"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useWorkspaceStore, getCookie } from "@/stores/workspace.store";
import { useProjectStore } from "@/stores/project.store";
import { useBoardStore } from "@/stores/board.store";
import { workspaceService } from "../services/workspace.service";
import { projectService } from "@/features/projects/services/project.service";
import { boardService } from "@/features/boards/services/board.service";

export function useActiveStateSync() {
  const { activeWorkspaceId, setActiveWorkspaceId } = useWorkspaceStore();
  const { activeProjectId, setActiveProjectId, archivedEntity, setArchivedEntity } = useProjectStore();
  const { activeBoardId, setActiveBoardId } = useBoardStore();

  const prevWorkspaceIdRef = useRef<string | null>(null);
  const prevProjectIdRef = useRef<string | null>(null);

  // 1. Fetch workspaces
  const workspacesQuery = useQuery({
    queryKey: ["workspaces"],
    queryFn: workspaceService.listWorkspaces,
  });
  const workspaces = workspacesQuery.data;

  // 2. Fetch active workspace projects
  const projectsQuery = useQuery({
    queryKey: ["projects", activeWorkspaceId, false],
    queryFn: () => projectService.listProjects(activeWorkspaceId!, false),
    enabled: !!activeWorkspaceId,
  });
  const projects = projectsQuery.data;

  // 3. Fetch active project boards
  const boardsQuery = useQuery({
    queryKey: ["boards", activeProjectId],
    queryFn: () => boardService.listBoards(activeProjectId!),
    enabled: !!activeProjectId,
  });
  const boards = boardsQuery.data;

  // 4. Initial load from cookies on mount
  useEffect(() => {
    const savedWorkspace = getCookie("kando_active_workspace");
    if (savedWorkspace) {
      setActiveWorkspaceId(savedWorkspace);
      const savedProject = getCookie("kando_active_project");
      if (savedProject) {
        setActiveProjectId(savedProject);
        const savedBoard = getCookie("kando_active_board");
        if (savedBoard) {
          setActiveBoardId(savedBoard);
        }
      }
    }
  }, [setActiveWorkspaceId, setActiveProjectId, setActiveBoardId]);

  // 5. Sync activeWorkspaceId with workspaces list
  useEffect(() => {
    if (workspacesQuery.isSuccess && workspaces) {
      if (workspaces.length > 0) {
        const savedId = getCookie("kando_active_workspace");
        if (savedId && !activeWorkspaceId && workspaces.some((w) => w.id === savedId)) {
          return;
        }
        const exists = workspaces.some((w) => w.id === activeWorkspaceId);
        if (!activeWorkspaceId || !exists) {
          setActiveWorkspaceId(workspaces[0].id);
        }
      } else {
        if (activeWorkspaceId !== null) {
          setActiveWorkspaceId(null);
        }
      }
    }
  }, [workspacesQuery.isSuccess, workspaces, activeWorkspaceId, setActiveWorkspaceId]);

  // 6. Reset project and board selection when workspace changes (user-initiated only)
  useEffect(() => {
    const prevWorkspaceId = prevWorkspaceIdRef.current;
    if (prevWorkspaceId !== null && activeWorkspaceId !== prevWorkspaceId) {
      setArchivedEntity(null);
      setActiveProjectId(null);
      setActiveBoardId(null);
    }
    prevWorkspaceIdRef.current = activeWorkspaceId;
  }, [activeWorkspaceId, setArchivedEntity, setActiveProjectId, setActiveBoardId]);

  // Query details of activeProjectId separately if not in list to check if archived
  const activeProjectQuery = useQuery({
    queryKey: ["project", activeProjectId],
    queryFn: () => projectService.getProject(activeProjectId!),
    enabled: !!activeProjectId && projects !== undefined && projects !== null && !projects.some((p) => p.id === activeProjectId),
    retry: false,
  });

  // 7. Watch the active project details query for archive status
  useEffect(() => {
    if (activeProjectQuery.data && activeProjectQuery.data.archived_at && activeProjectQuery.data.id === activeProjectId) {
      const pName = activeProjectQuery.data.name;
      setActiveProjectId(null);
      setActiveBoardId(null);
      setArchivedEntity({
        id: activeProjectQuery.data.id,
        type: "project",
        name: pName,
      });
    }
  }, [activeProjectQuery.data, activeProjectId, setActiveProjectId, setActiveBoardId, setArchivedEntity]);

  // 8. Sync activeProjectId with projects list
  useEffect(() => {
    if (archivedEntity) return;

    if (activeWorkspaceId && projectsQuery.isSuccess && projects) {
      if (projects.length > 0) {
        const savedId = getCookie("kando_active_project");
        if (savedId && !activeProjectId && projects.some((p) => p.id === savedId)) {
          return;
        }
        const exists = projects.some((p) => p.id === activeProjectId);
        if (!activeProjectId || !exists) {
          const isLoadingOrChecking = activeProjectId && activeProjectQuery.isLoading;
          if (!isLoadingOrChecking) {
            if (!activeProjectId || activeProjectQuery.isError || (activeProjectQuery.data && !activeProjectQuery.data.archived_at)) {
              setActiveProjectId(projects[0].id);
            }
          }
        }
      } else {
        if (activeProjectId !== null) {
          setActiveProjectId(null);
        }
      }
    }
  }, [
    projectsQuery.isSuccess,
    projects,
    activeWorkspaceId,
    activeProjectId,
    setActiveProjectId,
    archivedEntity,
    activeProjectQuery.data,
    activeProjectQuery.isError,
    activeProjectQuery.isLoading,
  ]);

  // Reset board selection when active project changes (user-initiated only)
  useEffect(() => {
    const prevProjectId = prevProjectIdRef.current;
    if (prevProjectId !== null && activeProjectId !== prevProjectId) {
      setActiveBoardId(null);
    }
    prevProjectIdRef.current = activeProjectId;
  }, [activeProjectId, setActiveBoardId]);

  // 9. Sync activeBoardId with boards list
  useEffect(() => {
    if (activeProjectId && boardsQuery.isSuccess && boards) {
      if (boards.length > 0) {
        const savedId = getCookie("kando_active_board");
        if (savedId && !activeBoardId && boards.some((b) => b.id === savedId)) {
          return;
        }
        const exists = boards.some((b) => b.id === activeBoardId);
        if (!activeBoardId || !exists) {
          setActiveBoardId(boards[0].id);
        }
      } else {
        if (activeBoardId !== null) {
          setActiveBoardId(null);
        }
      }
    }
  }, [boardsQuery.isSuccess, boards, activeProjectId, activeBoardId, setActiveBoardId]);
}
