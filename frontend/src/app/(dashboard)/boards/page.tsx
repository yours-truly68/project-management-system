"use client";

import * as React from "react";
import { useBoards, useDeleteBoard } from "@/features/boards/hooks/use-boards";
import { useProject } from "@/features/projects/hooks/use-projects";
import { useTasks } from "@/features/tasks/hooks/use-tasks";
import { useProjectStore } from "@/stores/project.store";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { useWorkspaceMembers } from "@/features/workspaces/hooks/use-workspace-members";
import { useAuthStore } from "@/stores/auth.store";
import { Board } from "@/features/boards/types/board.types";
import { CreateBoardModal } from "@/features/boards/components/create-board-modal";
import { EditBoardModal } from "@/features/boards/components/edit-board-modal";
import { BoardEmptyState } from "@/features/boards/components/board-empty-state";
import {
  Plus,
  Loader2,
  Edit3,
  Trash2,
  Check,
  AlertTriangle,
  X,
  Calendar,
  MoreHorizontal,
  Star,
} from "lucide-react";
import { getErrorMessage, cn } from "@/lib/utils";
import { useFavorites, useCreateFavorite, useDeleteFavorite } from "@/features/favorites/hooks/use-favorites";

interface BoardCardProps {
  board: Board;
  projectKey?: string;
  isActive: boolean;
  canManage: boolean;
  activeMenuId: string | null;
  setActiveMenuId: (id: string | null) => void;
  onEdit: (board: Board) => void;
  onDelete: (board: Board) => void;
  onSelect: (id: string) => void;
}

function BoardCard({
  board,
  projectKey,
  isActive,
  canManage,
  activeMenuId,
  setActiveMenuId,
  onEdit,
  onDelete,
  onSelect,
}: BoardCardProps) {
  const { data: tasks = [] } = useTasks(board.id);
  const { data: favorites = [] } = useFavorites();
  const { mutate: createFavorite } = useCreateFavorite();
  const { mutate: deleteFavorite } = useDeleteFavorite();

  const matchingFavorite = favorites.find(
    (fav) => fav.entity_type === "board" && fav.entity_id === board.id
  );
  const isFavorited = !!matchingFavorite;

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFavorited && matchingFavorite) {
      deleteFavorite(matchingFavorite.id);
    } else {
      createFavorite({ entity_type: "board", entity_id: board.id });
    }
  };

  const lastUpdated = new Date(board.updated_at).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  return (
    <div
      className={`flex flex-col justify-between p-5 rounded-2xl border bg-card shadow-[0_8px_24px_rgba(0,0,0,0.25)] transition-all duration-200 hover:translate-y-[-2px] hover:shadow-md ${
        isActive
          ? "border-[#3B82F6] ring-1 ring-[#3B82F6]/30 bg-card-hover/20"
          : "border-border hover:border-[#3B82F6] hover:bg-card-hover/40"
      }`}
    >
      {/* Card Header */}
      <div>
        <div className="flex items-center justify-between gap-3 overflow-hidden">
          <h3 className="font-bold text-lg text-foreground truncate" title={board.name}>
            {board.name}
          </h3>
          <button
            onClick={handleFavoriteToggle}
            className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-amber-500 transition-colors cursor-pointer shrink-0"
            aria-label={isFavorited ? "Unfavorite board" : "Favorite board"}
          >
            <Star
              className={cn(
                "w-4 h-4 transition-all duration-200",
                isFavorited ? "text-amber-500 fill-amber-500" : "text-muted-foreground/40"
              )}
            />
          </button>
        </div>

        <p className="text-sm text-secondary-text mt-2.5 line-clamp-2 min-h-[40px] leading-relaxed">
          {board.description || "No description provided."}
        </p>

        <div className="flex flex-wrap gap-2 mt-4">
          {projectKey && (
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-accent border border-border text-foreground flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Project: {projectKey}
            </span>
          )}
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-accent border border-border text-foreground flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-4 font-medium">
          <Calendar className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
          <span>Updated {lastUpdated}</span>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="flex items-center justify-between gap-2.5 pt-4 mt-5 border-t border-border/60">
        <button
          onClick={() => onSelect(board.id)}
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
            "Select Board"
          )}
        </button>

        <div className="relative">
          {canManage && (
            <button
              onClick={() => setActiveMenuId(activeMenuId === board.id ? null : board.id)}
              className="board-menu-trigger p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-card-hover transition-all cursor-pointer focus-visible:outline-none"
              aria-label="Board actions"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          )}

          {activeMenuId === board.id && (
            <div className="board-menu-dropdown absolute right-0 mt-1.5 w-36 rounded-lg border border-border bg-elevated shadow-2xl py-1 z-[9999] animate-fade-in text-left select-none">
              <button
                onClick={() => {
                  onEdit(board);
                  setActiveMenuId(null);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-foreground hover:bg-background/80 transition-colors text-left cursor-pointer font-medium"
              >
                <Edit3 className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Edit Board</span>
              </button>
              <button
                onClick={() => {
                  onDelete(board);
                  setActiveMenuId(null);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-500 hover:bg-rose-500/10 transition-colors text-left cursor-pointer font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Board</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BoardsPage() {
  const { activeWorkspaceId } = useWorkspaceStore();
  const { activeProjectId } = useProjectStore();
  const { user } = useAuthStore();
  const { members } = useWorkspaceMembers(activeWorkspaceId);
  const { boards, activeBoardId, setActiveBoardId, isLoading } = useBoards();
  const { mutateAsync: deleteBoard, isPending: isDeleting } = useDeleteBoard();
  const { data: project } = useProject(activeProjectId);

  // Dialog / Modal states
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [boardToEdit, setBoardToEdit] = React.useState<Board | null>(null);
  const [boardToDelete, setBoardToDelete] = React.useState<Board | null>(null);
  const [confirmName, setConfirmName] = React.useState("");
  const [deleteError, setDeleteError] = React.useState("");

  const [activeMenuId, setActiveMenuId] = React.useState<string | null>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (!target.closest(".board-menu-trigger") && !target.closest(".board-menu-dropdown")) {
        setActiveMenuId(null);
      }
    }
    if (activeMenuId !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeMenuId]);

  // Determine permissions: OWNER and ADMIN can manage boards, MEMBER can only view
  const currentUserMember = members.find((m) => m.user_id === user?.id);
  const role = currentUserMember?.role || "MEMBER";
  const canManage = role === "OWNER" || role === "ADMIN";

  const handleDeleteConfirm = async () => {
    if (!boardToDelete) return;
    if (confirmName !== boardToDelete.name) {
      setDeleteError("Typed name does not match.");
      return;
    }
    try {
      await deleteBoard(boardToDelete.id);
      setBoardToDelete(null);
      setConfirmName("");
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
      <div className="flex justify-center items-center py-24 select-none">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!activeWorkspaceId) {
    return (
      <div className="bg-secondary/20 rounded-xl border border-border p-8 text-center max-w-xl animate-fade-in select-none">
        <h2 className="text-lg font-bold text-foreground/90 font-heading">No Active Workspace</h2>
        <p className="text-xs text-muted-foreground mt-2">
          You must select or create a workspace first to manage its boards.
        </p>
      </div>
    );
  }

  if (!activeProjectId) {
    return (
      <div className="bg-secondary/20 rounded-xl border border-border p-8 text-center max-w-xl animate-fade-in select-none">
        <h2 className="text-lg font-bold text-foreground/90 font-heading">No Active Project</h2>
        <p className="text-xs text-muted-foreground mt-2">
          You must select or create a project first to manage its boards.
        </p>
      </div>
    );
  }

  if (boards.length === 0) {
    return <BoardEmptyState />;
  }

  return (
    <div className="space-y-6 select-none animate-fade-in max-w-7xl w-full mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground/90 font-heading tracking-tight">Boards</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Manage, select, and organize task pipelines inside the active project.
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Create Board
          </button>
        )}
      </div>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left column: Project Overview Card */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-card border border-border rounded-2xl p-5 shadow-[0_8px_24px_rgba(0,0,0,0.25)] space-y-5">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full select-none">
                Project Overview
              </span>
              <h3 className="font-bold text-xl text-foreground mt-3.5 truncate" title={project?.name}>
                {project?.name || "Loading..."}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 font-mono">
                Key: {project?.key || "loading"}
              </p>
            </div>

            {project?.description && (
              <p className="text-xs text-secondary-text leading-relaxed">
                {project.description}
              </p>
            )}

            <div className="border-t border-border/60 pt-4 space-y-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Project Stats
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-secondary/40 border border-border/40 p-3 rounded-xl text-center">
                  <span className="block text-xl font-bold text-foreground">{boards.length}</span>
                  <span className="text-[10px] text-muted-foreground uppercase font-medium">Boards</span>
                </div>
                <div className="bg-secondary/40 border border-border/40 p-3 rounded-xl text-center">
                  <span className="block text-xl font-bold text-foreground">{members.length}</span>
                  <span className="text-[10px] text-muted-foreground uppercase font-medium">Members</span>
                </div>
              </div>
            </div>

            <div className="border-t border-border/60 pt-4">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-3">
                Project Members
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

        {/* Right column: Boards Grid */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {boards.map((board) => (
              <BoardCard
                key={board.id}
                board={board}
                projectKey={project?.key}
                isActive={board.id === activeBoardId}
                canManage={canManage}
                activeMenuId={activeMenuId}
                setActiveMenuId={setActiveMenuId}
                onEdit={setBoardToEdit}
                onDelete={setBoardToDelete}
                onSelect={setActiveBoardId}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Modals & Dialogs */}
      {isCreateOpen && (
        <CreateBoardModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      )}

      {boardToEdit && (
        <EditBoardModal
          board={boardToEdit}
          isOpen={!!boardToEdit}
          onClose={() => setBoardToEdit(null)}
        />
      )}

      {boardToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-[2px] animate-fade-in select-none">
          <div
            className="relative w-full max-w-md bg-elevated border border-border rounded-[20px] shadow-2xl p-5 m-4 animate-scale-in"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 animate-pulse" />
                Delete Board
              </h3>
              <button
                onClick={() => {
                  setBoardToDelete(null);
                  setConfirmName("");
                  setDeleteError("");
                }}
                className="text-muted-foreground hover:text-foreground rounded p-1 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3.5 space-y-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Are you sure you want to delete the board{" "}
                <span className="font-semibold text-foreground">&quot;{boardToDelete.name}&quot;</span>?
                This action cannot be undone and will permanently delete all associated columns,
                tasks, and data.
              </p>

              {deleteError && (
                <div className="p-2.5 rounded border border-destructive/20 bg-destructive/10 text-destructive text-xs font-semibold leading-normal">
                  {deleteError}
                </div>
              )}

              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-foreground">
                  To confirm, type <span className="font-semibold text-rose-500 select-all">{boardToDelete.name}</span> below:
                </p>
                <input
                  type="text"
                  value={confirmName}
                  onChange={(e) => setConfirmName(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-all"
                  placeholder="Type board name to confirm..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-4 mt-4 border-t border-border">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  setBoardToDelete(null);
                  setConfirmName("");
                  setDeleteError("");
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-secondary border border-border text-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={confirmName !== boardToDelete.name || isDeleting}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Delete Board
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
