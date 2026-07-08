"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useBoardStore } from "@/stores/board.store";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { useWorkspaceMembers } from "@/features/workspaces/hooks/use-workspace-members";
import { useAuthStore } from "@/stores/auth.store";
import { useProjects } from "../hooks/use-projects";
import { CreateProjectModal } from "./create-project-modal";
import { CreateBoardModal } from "@/features/boards/components/create-board-modal";
import { boardService } from "@/features/boards/services/board.service";
import { cn } from "@/lib/utils";
import {
  Plus,
  Loader2,
  ChevronDown,
  ChevronRight,
  LayoutGrid,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProjectListSidebarProps {
  isCollapsed: boolean;
}

function SidebarTooltip({
  content,
  disabled,
  children,
}: {
  content: string;
  disabled?: boolean;
  children: React.ReactElement;
}) {
  if (disabled) return children;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={12}>
        {content}
      </TooltipContent>
    </Tooltip>
  );
}

// Deterministic color selection based on project key hash
function getProjectColor(key: string): string {
  const colors = [
    "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16",
    "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9", "#3b82f6",
    "#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e"
  ];
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

// Nested boards list for a specific project
function ProjectBoardsList({
  projectId,
  isCollapsed,
  activeBoardId,
  setActiveBoardId,
  setActiveProjectId,
  router,
}: {
  projectId: string;
  isCollapsed: boolean;
  activeBoardId: string | null;
  setActiveBoardId: (id: string | null) => void;
  setActiveProjectId: (id: string | null) => void;
  router: ReturnType<typeof useRouter>;
}) {
  const { data: boards = [], isLoading } = useQuery({
    queryKey: ["boards", projectId],
    queryFn: () => boardService.listBoards(projectId),
    enabled: !isCollapsed,
  });

  if (isCollapsed) return null;

  if (isLoading) {
    return (
      <div className="pl-8 py-1 flex items-center gap-1.5 text-xs text-muted-foreground/50">
        <Loader2 className="w-3 h-3 animate-spin" />
        <span>Loading...</span>
      </div>
    );
  }

  if (boards.length === 0) {
    return (
      <div className="pl-8 py-1.5 text-[11px] text-muted-foreground/40 italic">
        No boards yet
      </div>
    );
  }

  return (
    <div className="space-y-0.5 mt-0.5 pl-6">
      {boards.map((board) => {
        const isBoardActive = board.id === activeBoardId;
        return (
          <button
            key={board.id}
            onClick={() => {
              setActiveProjectId(projectId);
              setActiveBoardId(board.id);
              router.push("/");
            }}
            className={cn(
              "w-full flex items-center gap-2 px-2.5 py-1 rounded text-xs text-sidebar-foreground/75 hover:text-sidebar-foreground hover:bg-sidebar-accent/40 transition-all text-left cursor-pointer",
              isBoardActive && "bg-sidebar-accent text-foreground font-semibold border-l border-primary/60 pl-2 rounded-l-none"
            )}
          >
            <LayoutGrid className="w-3 h-3 text-muted-foreground/60 shrink-0" />
            <span className="truncate flex-1 font-medium">{board.name}</span>
          </button>
        );
      })}
    </div>
  );
}

export function ProjectListSidebar({ isCollapsed }: ProjectListSidebarProps) {
  const router = useRouter();
  const { activeWorkspaceId } = useWorkspaceStore();
  const { user } = useAuthStore();
  const { members } = useWorkspaceMembers(activeWorkspaceId);
  const { projects, activeProjectId, setActiveProjectId, isLoading } = useProjects();
  const { activeBoardId, setActiveBoardId } = useBoardStore();

  const [isSectionOpen, setIsSectionOpen] = React.useState(true);
  const [expandedProjects, setExpandedProjects] = React.useState<Record<string, boolean>>({});
  const [isProjectModalOpen, setIsProjectModalOpen] = React.useState(false);
  const [createBoardForProjectId, setCreateBoardForProjectId] = React.useState<string | null>(null);

  const toggleProject = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedProjects((prev) => {
      const current = prev[projectId] !== undefined ? prev[projectId] : projectId === activeProjectId;
      return { ...prev, [projectId]: !current };
    });
  };

  const handleProjectSelect = (projectId: string) => {
    setActiveProjectId(projectId);
    setActiveBoardId(null);
    router.push("/boards");
  };

  // Permission check: only OWNER and ADMIN can create projects/boards
  const currentUserMember = members.find((m) => m.user_id === user?.id);
  const canCreate =
    currentUserMember?.role === "OWNER" || currentUserMember?.role === "ADMIN";

  if (!activeWorkspaceId) return null;

  return (
    <div className="space-y-1">
      {/* Group Header */}
      {!isCollapsed ? (
        <div className="flex items-center justify-between px-2.5 py-1 text-[11px] font-bold text-sidebar-foreground/45 uppercase tracking-wider">
          <button
            onClick={() => setIsSectionOpen(!isSectionOpen)}
            className="flex items-center gap-1 hover:text-sidebar-foreground transition-colors cursor-pointer"
          >
            {isSectionOpen ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
            <span>Projects & Boards</span>
          </button>
          {canCreate && (
            <button
              onClick={() => setIsProjectModalOpen(true)}
              className="text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded p-0.5 transition-colors cursor-pointer"
              title="Create new project"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ) : (
        canCreate && (
          <div className="flex justify-center py-1">
            <SidebarTooltip content="Create new project">
              <button
                onClick={() => setIsProjectModalOpen(true)}
                className="text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded p-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </SidebarTooltip>
          </div>
        )
      )}

      {/* Main List */}
      {isSectionOpen && (
        <div className="space-y-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-3 text-sidebar-foreground/50">
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              {!isCollapsed && <span className="text-xs ml-2">Loading...</span>}
            </div>
          ) : projects.length === 0 ? (
            !isCollapsed && (
              <div className="px-2.5 py-2 text-xs text-sidebar-foreground/45 italic">
                No projects yet.
              </div>
            )
          ) : (
            projects.map((project) => {
              const isProjectActive = project.id === activeProjectId;
              const isExpanded = !!expandedProjects[project.id];
              const projectColor = getProjectColor(project.key);

              return (
                <div key={project.id} className="space-y-0.5">
                  <SidebarTooltip
                    content={project.name}
                    disabled={!isCollapsed}
                  >
                    <div
                      onClick={() => handleProjectSelect(project.id)}
                      className={cn(
                        "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[14px] text-sidebar-foreground/75 hover:text-sidebar-foreground w-full text-left transition-all hover:bg-sidebar-accent/30 cursor-pointer group/item relative",
                        isProjectActive && "bg-sidebar-accent/50 text-foreground font-semibold"
                      )}
                    >
                      {/* Left side: Expand Chevron (only if not collapsed) & Color Bullet */}
                      {!isCollapsed && (
                        <button
                          onClick={(e) => toggleProject(project.id, e)}
                          className="p-0.5 hover:bg-accent/40 rounded text-muted-foreground/60 hover:text-foreground shrink-0 cursor-pointer"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-3 h-3" />
                          ) : (
                            <ChevronRight className="w-3 h-3" />
                          )}
                        </button>
                      )}

                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: projectColor }}
                      />

                      {!isCollapsed && (
                        <span className="truncate flex-1 font-medium">
                          {project.name}
                        </span>
                      )}

                      {/* Keys and Actions inside the row */}
                      {!isCollapsed && (
                        <div className="flex items-center gap-1.5 opacity-0 group-hover/item:opacity-100 transition-opacity">
                          {canCreate && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setCreateBoardForProjectId(project.id);
                              }}
                              className="p-0.5 hover:bg-accent/50 rounded text-muted-foreground/60 hover:text-foreground cursor-pointer"
                              title="Create board inside project"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          )}
                          <span className="text-[9px] text-sidebar-foreground/30 font-mono font-bold uppercase">
                            {project.key}
                          </span>
                        </div>
                      )}
                    </div>
                  </SidebarTooltip>

                  {/* Nested Boards list */}
                  {!isCollapsed && isExpanded && (
                    <ProjectBoardsList
                      projectId={project.id}
                      isCollapsed={isCollapsed}
                      activeBoardId={activeBoardId}
                      setActiveBoardId={setActiveBoardId}
                      setActiveProjectId={setActiveProjectId}
                      router={router}
                    />
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Creation Modals */}
      {isProjectModalOpen && (
        <CreateProjectModal
          isOpen={isProjectModalOpen}
          onClose={() => setIsProjectModalOpen(false)}
        />
      )}

      {createBoardForProjectId && (
        <CreateBoardModal
          isOpen={!!createBoardForProjectId}
          onClose={() => setCreateBoardForProjectId(null)}
          projectId={createBoardForProjectId}
        />
      )}
    </div>
  );
}

export default ProjectListSidebar;
