"use client";

import * as React from "react";
import { useProjects, useDeleteProject, useUpdateProject } from "@/features/projects/hooks/use-projects";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { useWorkspaceMembers } from "@/features/workspaces/hooks/use-workspace-members";
import { useAuthStore } from "@/stores/auth.store";
import { Project } from "@/features/projects/types/project.types";
import { CreateProjectModal } from "@/features/projects/components/create-project-modal";
import { EditProjectModal } from "@/features/projects/components/edit-project-modal";
import { ProjectEmptyState } from "@/features/projects/components/project-empty-state";
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
} from "lucide-react";
import { getErrorMessage } from "@/lib/utils";

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
}

function ProjectCard({
  project,
  isActive,
  canCreateOrEdit,
  canDelete,
  onEdit,
  onDelete,
  onSelect,
}: ProjectCardProps) {
  const { mutateAsync: updateProject, isPending: isUpdating } = useUpdateProject(project.id);
  const color = getProjectColor(project.key);
  const createdDate = new Date(project.created_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const handleArchive = async () => {
    try {
      await updateProject({ is_archived: !project.is_archived });
    } catch (err) {
      console.error("Failed to archive project:", err);
    }
  };

  return (
    <div
      className={`flex flex-col justify-between p-5 rounded-xl border bg-card/50 transition-all ${
        isActive
          ? "border-primary shadow-sm shadow-primary/5 bg-card"
          : "border-border hover:border-border-hover"
      }`}
    >
      {/* Card Header */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div
              className="w-3.5 h-3.5 rounded-full shrink-0"
              style={{ backgroundColor: color }}
            />
            <h3 className="font-bold text-sm text-foreground truncate" title={project.name}>
              {project.name}
            </h3>
          </div>
          <span className="text-[10px] px-2.5 py-0.5 rounded font-bold uppercase tracking-wider bg-secondary border border-border text-muted-foreground shrink-0">
            {project.key}
          </span>
        </div>

        <p className="text-xs text-muted-foreground mt-2.5 line-clamp-2 min-h-[32px] leading-relaxed">
          {project.description || "No description provided."}
        </p>

        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/80 mt-4 font-medium">
          <Calendar className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
          <span>Created {createdDate}</span>
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
          <button
            onClick={handleArchive}
            disabled={isUpdating}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-secondary hover:bg-secondary/80 text-foreground border border-border transition-all cursor-pointer disabled:opacity-50"
          >
            {isUpdating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Archive className="w-3.5 h-3.5 text-muted-foreground/75" />
            )}
            Restore Project
          </button>
        ) : (
          <button
            onClick={() => onSelect(project.id)}
            disabled={isActive}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              isActive
                ? "bg-primary/10 text-primary border border-primary/20 pointer-events-none"
                : "bg-secondary hover:bg-secondary/80 text-foreground border border-border"
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

        <div className="flex items-center gap-1.5">
          {canCreateOrEdit && !project.archived_at && (
            <button
              onClick={() => onEdit(project)}
              className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-all cursor-pointer"
              title="Edit Project"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}
          {canCreateOrEdit && !project.archived_at && (
            <button
              onClick={handleArchive}
              disabled={isUpdating}
              className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-amber-500 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-all cursor-pointer"
              title="Archive Project"
            >
              {isUpdating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Archive className="w-3.5 h-3.5" />
              )}
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => onDelete(project)}
              className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-rose-500 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 transition-all cursor-pointer"
              title="Delete Project"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const { activeWorkspaceId } = useWorkspaceStore();
  const { user } = useAuthStore();
  const { members } = useWorkspaceMembers(activeWorkspaceId);
  const [showArchived, setShowArchived] = React.useState(false);

  const { projects, activeProjectId, setActiveProjectId, isLoading } = useProjects(showArchived);
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!activeWorkspaceId) {
    return (
      <div className="bg-secondary/20 rounded-xl border border-border p-8 text-center max-w-xl animate-fade-in">
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
    <div className="space-y-6 select-none animate-fade-in max-w-[1000px] w-full mx-auto px-4 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h2 className="text-xl font-bold text-foreground/90 font-heading">Projects</h2>
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
          <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center rounded-xl border border-dashed border-border bg-card/20 animate-fade-in select-none">
            <Archive className="w-8 h-8 text-muted-foreground/30 mb-3" />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              isActive={project.id === activeProjectId}
              canCreateOrEdit={canCreateOrEdit}
              canDelete={canDelete}
              onEdit={setProjectToEdit}
              onDelete={setProjectToDelete}
              onSelect={setActiveProjectId}
            />
          ))}
        </div>
      )}

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-[2px] animate-fade-in select-none">
          <div
            className="relative w-full max-w-md bg-card border border-border rounded-lg shadow-xl p-5 m-4 animate-scale-in"
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
