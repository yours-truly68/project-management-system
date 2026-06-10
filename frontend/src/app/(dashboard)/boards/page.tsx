"use client";

import * as React from "react";
import { useBoards, useDeleteBoard } from "@/features/boards/hooks/use-boards";
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
} from "lucide-react";
import { getErrorMessage } from "@/lib/utils";

export default function BoardsPage() {
  const { activeWorkspaceId } = useWorkspaceStore();
  const { activeProjectId } = useProjectStore();
  const { user } = useAuthStore();
  const { members } = useWorkspaceMembers(activeWorkspaceId);
  const { boards, activeBoardId, setActiveBoardId, isLoading } = useBoards();
  const { mutateAsync: deleteBoard, isPending: isDeleting } = useDeleteBoard();

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
    <div className="space-y-6 select-none animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h2 className="text-xl font-bold text-foreground/90 font-heading">Boards</h2>
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

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {boards.map((board) => {
          const isActive = board.id === activeBoardId;
          const createdDate = new Date(board.created_at).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          });

          return (
            <div
              key={board.id}
              className={`flex flex-col justify-between p-5 rounded-xl border bg-card/50 transition-all ${
                isActive
                  ? "border-primary shadow-sm shadow-primary/5 bg-card"
                  : "border-border hover:border-border-hover"
              }`}
            >
              {/* Card Header */}
              <div>
                <h3 className="font-bold text-sm text-foreground truncate" title={board.name}>
                  {board.name}
                </h3>

                <p className="text-xs text-muted-foreground mt-2.5 line-clamp-2 min-h-[32px] leading-relaxed">
                  {board.description || "No description provided."}
                </p>

                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/80 mt-4 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                  <span>Created {createdDate}</span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between gap-2.5 pt-4 mt-5 border-t border-border/60">
                <button
                  onClick={() => setActiveBoardId(board.id)}
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
                    "Select Board"
                  )}
                </button>

                <div className="relative">
                  {canManage && (
                    <button
                      onClick={() => setActiveMenuId(activeMenuId === board.id ? null : board.id)}
                      className="board-menu-trigger p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-all cursor-pointer focus-visible:outline-none"
                      aria-label="Board actions"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  )}

                  {activeMenuId === board.id && (
                    <div className="board-menu-dropdown absolute right-0 mt-1 w-36 rounded-lg border border-border bg-card shadow-lg py-1 z-10 animate-fade-in text-left select-none">
                      <button
                        onClick={() => {
                          setBoardToEdit(board);
                          setActiveMenuId(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-foreground hover:bg-secondary transition-colors text-left cursor-pointer font-medium"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>Edit Board</span>
                      </button>
                      <button
                        onClick={() => {
                          setBoardToDelete(board);
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
        })}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-[2px] animate-fade-in select-none">
          <div
            className="relative w-full max-w-md bg-card border border-border rounded-lg shadow-xl p-5 m-4 animate-scale-in"
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
