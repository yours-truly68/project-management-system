"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueries } from "@tanstack/react-query";
import { useProjects, useDeleteProject, useUpdateProject } from "@/features/projects/hooks/use-projects";
import { useBoardStore } from "@/stores/board.store";
import { boardService } from "@/features/boards/services/board.service";
import { taskService } from "@/features/tasks/services/task.service";
import { columnService } from "@/features/columns/services/column.service";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { useWorkspaceMembers } from "@/features/workspaces/hooks/use-workspace-members";
import { useAuthStore } from "@/stores/auth.store";
import { Project } from "@/features/projects/types/project.types";
import { CreateProjectModal } from "@/features/projects/components/create-project-modal";
import { EditProjectModal } from "@/features/projects/components/edit-project-modal";
import { ProjectEmptyState } from "@/features/projects/components/project-empty-state";
import { useWorkspaces } from "@/features/workspaces/hooks/use-workspaces";
import { cn, getErrorMessage } from "@/lib/utils";
import {
  Plus,
  Loader2,
  Edit3,
  Trash2,
  Check,
  AlertTriangle,
  X,
  Archive,
  MoreHorizontal,
  Star,
  Folder,
  LayoutGrid,
  Users,
} from "lucide-react";
import { useFavorites, useCreateFavorite, useDeleteFavorite } from "@/features/favorites/hooks/use-favorites";

import {
  PageContainer,
  PageHeader,
  ActionToolbar,
  ContentGrid,
  StatCard,
  EntityCard,
  EmptyState,
  SearchInput,
  ProgressIndicator,
} from "@/components/ui/primitives";

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

interface ProjectCardProps {
  project: Project;
  isActive: boolean;
  canCreateOrEdit: boolean;
  canDelete: boolean;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onSelect: (id: string) => void;
  memberCount: number;
}

function ProjectCard({
  project,
  isActive,
  canCreateOrEdit,
  canDelete,
  onEdit,
  onDelete,
  onSelect,
  memberCount,
}: ProjectCardProps) {
  const { mutateAsync: updateProject } = useUpdateProject(project.id);
  const { data: favorites = [] } = useFavorites();
  const { mutate: createFavorite } = useCreateFavorite();
  const { mutate: deleteFavorite } = useDeleteFavorite();

  const matchingFavorite = favorites.find(
    (fav) => fav.entity_type === "project" && fav.entity_id === project.id
  );
  const isFavorited = !!matchingFavorite;

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFavorited && matchingFavorite) {
      deleteFavorite(matchingFavorite.id);
    } else {
      createFavorite({ entity_type: "project", entity_id: project.id });
    }
  };

  const color = getProjectColor(project.key);
  const lastUpdated = new Date(project.updated_at).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  // Fetch boards
  const { data: boards = [] } = useQuery({
    queryKey: ["boards", project.id],
    queryFn: () => boardService.listBoards(project.id),
  });

  // Fetch columns and tasks client-side to calculate progress
  const boardDataQueries = useQueries({
    queries: boards.map((b) => ({
      queryKey: ["board-aggregate", b.id],
      queryFn: async () => {
        try {
          const [cols, tsk] = await Promise.all([
            columnService.listColumns(b.id),
            taskService.listTasks(b.id),
          ]);
          return { columns: cols, tasks: tsk };
        } catch {
          return { columns: [], tasks: [] };
        }
      },
    })),
  });

  const progressMetrics = React.useMemo(() => {
    let totalTasks = 0;
    let completedTasks = 0;

    boardDataQueries.forEach((q) => {
      if (!q.data) return;
      const { columns: cols, tasks: tsk } = q.data;
      totalTasks += tsk.length;

      // Identify column IDs that are completed
      const doneColIds = new Set(
        cols
          .filter((c) => {
            const name = c.name.toLowerCase();
            return name.includes("done") || name.includes("complete") || name.includes("finish");
          })
          .map((c) => c.id)
      );

      completedTasks += tsk.filter((t) => doneColIds.has(t.column_id)).length;
    });

    const percent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    return { percent, totalTasks };
  }, [boardDataQueries]);

  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  const handleArchive = async () => {
    try {
      await updateProject({ is_archived: !project.is_archived });
    } catch (err) {
      console.error("Failed to archive project:", err);
    }
  };

  return (
    <EntityCard
      title={project.name}
      description={project.description || "No description provided."}
      onClick={() => {
        if (!project.archived_at) {
          onSelect(project.id);
        }
      }}
      className={cn(
        isActive && "border-primary bg-accent/10"
      )}
      icon={
        <div className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: color }}
          />
        </div>
      }
      actions={
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={handleFavoriteToggle}
            className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-amber-500 transition-colors cursor-pointer shrink-0"
            aria-label={isFavorited ? "Unfavorite project" : "Favorite project"}
          >
            <Star
              className={cn(
                "w-3.5 h-3.5 transition-all duration-200",
                isFavorited ? "text-amber-500 fill-amber-500" : "text-muted-foreground/35"
              )}
            />
          </button>

          <div className="relative" ref={menuRef}>
            {(canCreateOrEdit || canDelete) && (
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-all cursor-pointer focus-visible:outline-none"
                aria-label="Project actions"
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
            )}

            {isMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-36 rounded-lg border border-border bg-elevated shadow-xl py-1 z-30 animate-fade-in text-left select-none glass">
                {canCreateOrEdit && !project.archived_at && (
                  <button
                    onClick={() => {
                      onEdit(project);
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-foreground hover:bg-background/80 transition-colors text-left cursor-pointer font-medium"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>Edit Project</span>
                  </button>
                )}
                {canCreateOrEdit && (
                  <button
                    onClick={() => {
                      handleArchive();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-foreground hover:bg-background/80 transition-colors text-left cursor-pointer font-medium"
                  >
                    <Archive className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>{project.archived_at ? "Restore Project" : "Archive Project"}</span>
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => {
                      onDelete(project);
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-500 hover:bg-rose-500/10 transition-colors text-left cursor-pointer font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Project</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      }
      metadata={
        <div className="w-full space-y-3">
          <div className="flex items-center justify-between">
            <ProgressIndicator value={progressMetrics.percent} />
            <span className="text-[10px] text-muted-foreground font-semibold">
              {progressMetrics.totalTasks} tasks
            </span>
          </div>

          <div className="flex items-center justify-between text-[10px] text-muted-foreground border-t border-border/10 pt-2 font-medium">
            <span className="flex items-center gap-1.5">
              <LayoutGrid className="w-3.5 h-3.5 text-muted-foreground/50" />
              {boards.length} boards
            </span>
            <span>Updated {lastUpdated}</span>
          </div>
        </div>
      }
    />
  );
}

export default function ProjectsPage() {
  const router = useRouter();
  const { activeWorkspace } = useWorkspaces();
  const { activeWorkspaceId } = useWorkspaceStore();
  const { user } = useAuthStore();
  const { members } = useWorkspaceMembers(activeWorkspaceId);
  const [showArchived, setShowArchived] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const { projects, activeProjectId, setActiveProjectId, isLoading } = useProjects(showArchived);
  const { mutateAsync: deleteProject, isPending: isDeleting } = useDeleteProject();

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [projectToEdit, setProjectToEdit] = React.useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = React.useState<Project | null>(null);
  const [confirmKey, setConfirmKey] = React.useState("");
  const [deleteError, setDeleteError] = React.useState("");

  // Determine permissions
  const currentUserMember = members.find((m) => m.user_id === user?.id);
  const role = currentUserMember?.role || "MEMBER";
  const canCreateOrEdit = role === "OWNER" || role === "ADMIN";
  const canDelete = role === "OWNER";

  const handleSelectProject = (projectId: string) => {
    setActiveProjectId(projectId);
    const { setActiveBoardId } = useBoardStore.getState();
    setActiveBoardId(null);
    router.push("/boards");
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;
    if (confirmKey !== projectToDelete.key) {
      setDeleteError("Typed key does not match.");
      return;
    }
    try {
      await deleteProject(projectToDelete.id);
      setProjectToDelete(null);
      setConfirmKey("");
      setDeleteError("");
    } catch (err) {
      setDeleteError(getErrorMessage(err));
    }
  };

  // Fetch workspace board-task metrics client-side for stats
  const allBoardsQueries = useQueries({
    queries: projects.map((p) => ({
      queryKey: ["boards", p.id],
      queryFn: () => boardService.listBoards(p.id),
    })),
  });

  const allBoardsList = React.useMemo(() => {
    return allBoardsQueries.flatMap((q) => q.data || []);
  }, [allBoardsQueries]);

  const allTasksQueries = useQueries({
    queries: allBoardsList.map((b) => ({
      queryKey: ["tasks", b.id],
      queryFn: () => taskService.listTasks(b.id),
    })),
  });

  const taskStats = React.useMemo(() => {
    let completed = 0;
    let active = 0;

    allTasksQueries.forEach((q) => {
      if (!q.data) return;
      q.data.forEach((t) => {
        // Assume simple statuses or simple task metrics
        if (t.priority === "LOW") {
          completed++;
        } else {
          active++;
        }
      });
    });

    return { completed, active };
  }, [allTasksQueries]);

  if (isLoading) {
    return (
      <PageContainer className="animate-pulse">
        <div className="h-8 w-48 bg-accent/30 rounded-lg mb-6" />
        <div className="h-40 bg-accent/20 rounded-xl" />
      </PageContainer>
    );
  }

  if (!activeWorkspaceId) {
    return (
      <PageContainer className="flex items-center justify-center p-8">
        <EmptyState
          title="No Active Workspace"
          description="Select or create a workspace from the sidebar to see projects."
          icon={Folder}
        />
      </PageContainer>
    );
  }

  // Filter projects by query and state
  const filteredProjects = projects.filter((p) => {
    const matchesState = showArchived ? p.archived_at !== null : p.archived_at === null;
    const matchesQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.key.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesState && matchesQuery;
  });

  return (
    <PageContainer className="animate-fade-in select-none">
      <PageHeader
        title="Projects"
        description="Manage, select, and customize projects inside this workspace."
        actions={
          canCreateOrEdit && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Create Project
            </button>
          )
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 shrink-0">
        <StatCard label="Total Projects" value={projects.length} icon={Folder} />
        <StatCard label="Active Boards" value={allBoardsList.length} icon={LayoutGrid} />
        <StatCard label="Workspace Members" value={members.length} icon={Users} />
        <StatCard label="Workspace Slug" value={`/${activeWorkspace?.slug || "Slug"}`} icon={Check} />
      </div>

      <ActionToolbar className="mt-6">
        <SearchInput
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="flex border-b border-border/20 gap-4 text-xs font-semibold pb-px shrink-0">
          <button
            onClick={() => setShowArchived(false)}
            className={cn(
              "pb-2 border-b-2 transition-all cursor-pointer px-1 -mb-px text-xs uppercase tracking-wider font-bold",
              !showArchived
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Active Projects
          </button>
          <button
            onClick={() => setShowArchived(true)}
            className={cn(
              "pb-2 border-b-2 transition-all cursor-pointer px-1 -mb-px text-xs uppercase tracking-wider font-bold",
              showArchived
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Archived Projects
          </button>
        </div>
      </ActionToolbar>

      {/* Main Grid */}
      <div className="flex-1 min-h-0 overflow-auto pt-6">
        {filteredProjects.length === 0 ? (
          showArchived ? (
            <EmptyState
              title="No Archived Projects"
              description="Projects you archive will appear here. Archiving hides projects while keeping all history."
              icon={Archive}
            />
          ) : (
            <ProjectEmptyState />
          )
        ) : (
          <ContentGrid>
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                isActive={project.id === activeProjectId}
                canCreateOrEdit={canCreateOrEdit}
                canDelete={canDelete}
                onEdit={setProjectToEdit}
                onDelete={setProjectToDelete}
                onSelect={handleSelectProject}
                memberCount={members.length}
              />
            ))}
          </ContentGrid>
        )}
      </div>

      {/* Modals & Dialogs */}
      {isCreateOpen && (
        <CreateProjectModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      )}

      {projectToEdit && (
        <EditProjectModal
          project={projectToEdit}
          isOpen={!!projectToEdit}
          onClose={() => setProjectToEdit(null)}
        />
      )}

      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-[2px] animate-fade-in select-none">
          <div
            className="relative w-full max-w-md bg-elevated border border-border rounded-[20px] shadow-2xl p-5 m-4 animate-scale-in"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                Delete Project
              </h3>
              <button
                onClick={() => {
                  setProjectToDelete(null);
                  setConfirmKey("");
                  setDeleteError("");
                }}
                className="text-muted-foreground hover:text-foreground rounded p-1 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3.5 space-y-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Are you sure you want to delete the project &ldquo;{projectToDelete.name}&rdquo;?
                This action cannot be undone and will permanently delete all associated boards,
                columns, tasks, and data.
              </p>

              {deleteError && (
                <div className="p-2.5 rounded border border-destructive/20 bg-destructive/10 text-destructive text-xs font-semibold leading-normal">
                  {deleteError}
                </div>
              )}

              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-foreground">
                  To confirm, type{" "}
                  <span className="font-mono text-rose-500 uppercase select-all">
                    {projectToDelete.key}
                  </span>{" "}
                  below:
                </p>
                <input
                  type="text"
                  value={confirmKey}
                  onChange={(e) => setConfirmKey(e.target.value.toUpperCase())}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-all uppercase"
                  placeholder="Type key to confirm..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-4 mt-4 border-t border-border">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  setProjectToDelete(null);
                  setConfirmKey("");
                  setDeleteError("");
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-secondary border border-border text-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={confirmKey !== projectToDelete.key || isDeleting}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
