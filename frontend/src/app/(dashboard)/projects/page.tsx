"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useProjects, useDeleteProject, useUpdateProject } from "@/features/projects/hooks/use-projects";
import { useBoardStore } from "@/stores/board.store";
import { useQuery } from "@tanstack/react-query";
import { boardService } from "@/features/boards/services/board.service";
import { taskService } from "@/features/tasks/services/task.service";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { useWorkspaceMembers } from "@/features/workspaces/hooks/use-workspace-members";
import { useAuthStore } from "@/stores/auth.store";
import { Project } from "@/features/projects/types/project.types";
import { CreateProjectModal } from "@/features/projects/components/create-project-modal";
import { EditProjectModal } from "@/features/projects/components/edit-project-modal";
import { ProjectEmptyState } from "@/features/projects/components/project-empty-state";
import { useWorkspaces } from "@/features/workspaces/hooks/use-workspaces";
import { cn } from "@/lib/utils";
import {
  Plus,
  Loader2,
  Edit3,
  Trash2,
  Check,
  AlertTriangle,
  X,
  Calendar,
  Archive,
  MoreHorizontal,
  Star,
} from "lucide-react";
import { getErrorMessage } from "@/lib/utils";
import { useFavorites, useCreateFavorite, useDeleteFavorite } from "@/features/favorites/hooks/use-favorites";

// Deterministic color selection based on project key hash
function getProjectColor(key: string): string {
  const colors = [
    "#ef4444", // red-500
    "#f97316", // orange-500
    "#f59e0b", // amber-500
    "#eab308", // yellow-500
    "#84cc16", // lime-500
    "#10b981", // emerald-500
    "#14b8a6", // teal-500
    "#06b6d4", // cyan-500
    "#0ea5e9", // sky-500
    "#3b82f6", // blue-500
    "#6366f1", // indigo-500
    "#8b5cf6", // violet-500
    "#a855f7", // purple-500
    "#d946ef", // fuchsia-500
    "#ec4899", // pink-500
    "#f43f5e", // rose-500
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

  // Fetch boards for this project
  const { data: boards = [] } = useQuery({
    queryKey: ["boards", project.id],
    queryFn: () => boardService.listBoards(project.id),
  });

  // Fetch tasks for each board to sum active tasks
  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks-summary", project.id],
    queryFn: async () => {
      let sum = 0;
      for (const b of boards) {
        try {
          const bt = await taskService.listTasks(b.id);
          if (Array.isArray(bt)) sum += bt.length;
        } catch {
          // Ignore
        }
      }
      return sum;
    },
    enabled: boards.length > 0,
  });

  const totalTasks = tasks || 0;

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
    <div
      onClick={() => {
        if (!project.archived_at) {
          onSelect(project.id);
        }
      }}
      className={cn(
        "flex flex-col justify-between p-5 rounded-2xl border bg-card shadow-[0_8px_24px_rgba(0,0,0,0.25)] transition-all duration-200 hover:translate-y-[-2px] hover:shadow-md cursor-pointer",
        isActive
          ? "border-[#3B82F6] ring-1 ring-[#3B82F6]/30 bg-card-hover/20"
          : "border-border hover:border-[#3B82F6] hover:bg-card-hover/40"
      )}
    >
      {/* Card Header */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div
              className="w-3.5 h-3.5 rounded-full shrink-0"
              style={{ backgroundColor: color }}
            />
            <h3 className="font-bold text-lg text-foreground truncate" title={project.name}>
              {project.name}
            </h3>
            <button
              onClick={handleFavoriteToggle}
              className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-amber-500 transition-colors cursor-pointer shrink-0"
              aria-label={isFavorited ? "Unfavorite project" : "Favorite project"}
            >
              <Star
                className={cn(
                  "w-4 h-4 transition-all duration-200",
                  isFavorited ? "text-amber-500 fill-amber-500" : "text-muted-foreground/40"
                )}
              />
            </button>
          </div>
          <span className="text-[10px] px-2.5 py-0.5 rounded font-bold uppercase tracking-wider bg-accent border border-border text-muted-foreground shrink-0">
            {project.key}
          </span>
        </div>

        <p className="text-sm text-secondary-text mt-2.5 line-clamp-2 min-h-[40px] leading-relaxed">
          {project.description || "No description provided."}
        </p>

        <div className="flex flex-wrap gap-2 mt-4">
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-accent border border-border text-foreground flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            {boards.length} {boards.length === 1 ? "board" : "boards"}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-accent border border-border text-foreground flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {totalTasks} {totalTasks === 1 ? "task" : "tasks"}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-accent border border-border text-foreground flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            {memberCount} {memberCount === 1 ? "member" : "members"}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-4 font-medium">
          <Calendar className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
          <span>Updated {lastUpdated}</span>
          {project.archived_at && (
            <span className="ml-auto text-[9px] px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded font-semibold uppercase tracking-wider">
              Archived
            </span>
          )}
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="flex items-center justify-between gap-2.5 pt-4 mt-5 border-t border-border/60">
        {project.archived_at ? (
          <span className="text-[10px] font-semibold text-amber-500 bg-amber-500/5 border border-amber-500/15 px-2.5 py-1 rounded-md select-none uppercase tracking-wider">
            Archived
          </span>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(project.id);
            }}
            disabled={isActive}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              isActive
                ? "bg-primary/10 text-primary border border-primary/20 pointer-events-none"
                : "bg-accent hover:bg-card-hover text-foreground border border-border"
            }`}
          >
            {isActive ? (
              <>
                <Check className="w-3.5 h-3.5 shrink-0" />
                Active
              </>
            ) : (
              "Select Project"
            )}
          </button>
        )}

        <div className="relative" ref={menuRef}>
          {(canCreateOrEdit || canDelete) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-card-hover transition-all cursor-pointer focus-visible:outline-none"
              aria-label="Project actions"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          )}

          {isMenuOpen && (
            <div
              className="board-menu-dropdown absolute right-0 mt-1.5 w-36 rounded-lg border border-border bg-elevated shadow-2xl py-1 z-[9999] animate-fade-in text-left select-none"
              onClick={(e) => e.stopPropagation()}
            >
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
    </div>
  );
}

export default function ProjectsPage() {
  const router = useRouter();
  const { activeWorkspace } = useWorkspaces();
  const { activeWorkspaceId } = useWorkspaceStore();
  const { user } = useAuthStore();
  const { members } = useWorkspaceMembers(activeWorkspaceId);
  const [showArchived, setShowArchived] = React.useState(false);

  const { projects, activeProjectId, setActiveProjectId, isLoading } = useProjects(showArchived);

  const handleSelectProject = (projectId: string) => {
    setActiveProjectId(projectId);
    const { setActiveBoardId } = useBoardStore.getState();
    setActiveBoardId(null);
    router.push("/boards");
  };
  const { mutateAsync: deleteProject, isPending: isDeleting } = useDeleteProject();

  // Dialog / Modal states
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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24 select-none animate-pulse">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!activeWorkspaceId) {
    return (
      <div className="bg-secondary/20 rounded-xl border border-border p-8 text-center max-w-xl animate-fade-in select-none">
        <h2 className="text-lg font-bold text-foreground/90 font-heading">No Active Workspace</h2>
        <p className="text-xs text-muted-foreground mt-2">
          You must select or create a workspace first to manage its projects.
        </p>
      </div>
    );
  }

  // Filter projects relative to showArchived selection
  const filteredProjects = projects.filter((p) =>
    showArchived ? p.archived_at !== null : p.archived_at === null
  );

  return (
    <div className="space-y-6 select-none animate-fade-in max-w-7xl w-full mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground/90 font-heading tracking-tight">Projects</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Manage, select, and customize projects inside this workspace.
          </p>
        </div>
        {canCreateOrEdit && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Create Project
          </button>
        )}
      </div>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left column: Workspace Info Card */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-card border border-border rounded-2xl p-5 shadow-[0_8px_24px_rgba(0,0,0,0.25)] space-y-5">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full select-none">
                Workspace Overview
              </span>
              <h3 className="font-bold text-xl text-foreground mt-3.5 truncate" title={activeWorkspace?.name}>
                {activeWorkspace?.name || "Loading..."}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 font-mono">
                /{activeWorkspace?.slug || "loading"}
              </p>
            </div>

            {activeWorkspace?.description && (
              <p className="text-xs text-secondary-text leading-relaxed">
                {activeWorkspace.description}
              </p>
            )}

            <div className="border-t border-border/60 pt-4 space-y-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Workspace Stats
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-secondary/40 border border-border/40 p-3 rounded-xl text-center">
                  <span className="block text-xl font-bold text-foreground">{projects.length}</span>
                  <span className="text-[10px] text-muted-foreground uppercase font-medium">Projects</span>
                </div>
                <div className="bg-secondary/40 border border-border/40 p-3 rounded-xl text-center">
                  <span className="block text-xl font-bold text-foreground">{members.length}</span>
                  <span className="text-[10px] text-muted-foreground uppercase font-medium">Members</span>
                </div>
              </div>
            </div>

            <div className="border-t border-border/60 pt-4">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-3">
                Team Members
              </h4>
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {members.slice(0, 5).map((member) => (
                  <div key={member.id} className="flex items-center gap-2 text-xs">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold border border-border text-[9px] shrink-0">
                      {getInitials(member.full_name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground truncate">{member.full_name}</p>
                      <p className="text-[9px] text-muted-foreground uppercase font-medium">{member.role}</p>
                    </div>
                  </div>
                ))}
                {members.length > 5 && (
                  <p className="text-[10px] text-muted-foreground text-center pt-1 font-medium">
                    + {members.length - 5} more members
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Content (Tabs and Projects list) */}
        <div className="lg:col-span-3 space-y-5">
          {/* Tabs Switcher */}
          <div className="flex border-b border-border gap-4 text-xs font-semibold pb-px">
            <button
              onClick={() => setShowArchived(false)}
              className={cn(
                "pb-2.5 border-b-2 transition-all cursor-pointer px-1 -mb-px text-sm",
                !showArchived
                  ? "border-primary text-foreground font-bold"
                  : "border-transparent text-muted-foreground hover:text-foreground font-medium"
              )}
            >
              Active Projects
            </button>
            <button
              onClick={() => setShowArchived(true)}
              className={cn(
                "pb-2.5 border-b-2 transition-all cursor-pointer px-1 -mb-px text-sm",
                showArchived
                  ? "border-primary text-foreground font-bold"
                  : "border-transparent text-muted-foreground hover:text-foreground font-medium"
              )}
            >
              Archived Projects
            </button>
          </div>

          {filteredProjects.length === 0 ? (
            showArchived ? (
              <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center rounded-xl border border-dashed border-border bg-card/20 select-none">
                <Archive className="w-8 h-8 text-muted-foreground/30 mb-3 shrink-0" />
                <h3 className="text-base font-semibold text-foreground mb-1">No Archived Projects</h3>
                <p className="text-xs text-muted-foreground max-w-sm mt-1">
                  Projects you archive will appear here. Archiving hides projects from the active sidebar and lists while keeping all history.
                </p>
              </div>
            ) : (
              <ProjectEmptyState />
            )
          ) : (
            /* Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
            </div>
          )}
        </div>
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
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 animate-pulse" />
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
                Are you sure you want to delete the project{" "}
                <span className="font-semibold text-foreground">&quot;{projectToDelete.name}&quot;</span>?
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
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-all uppercase"
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
    </div>
  );
}
