"use client";

import * as React from "react";
import { useWorkspaces } from "@/features/workspaces/hooks/use-workspaces";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { useBoards } from "@/features/boards/hooks/use-boards";
import { useColumns, useDeleteColumn } from "@/features/columns/hooks/use-columns";
import { useWorkspaceMembers } from "@/features/workspaces/hooks/use-workspace-members";
import { useAuthStore } from "@/stores/auth.store";
import { BoardEmptyState } from "@/features/boards/components/board-empty-state";
import { EditBoardModal } from "@/features/boards/components/edit-board-modal";
import { CreateColumnModal } from "@/features/columns/components/create-column-modal";
import { EditColumnModal } from "@/features/columns/components/edit-column-modal";
import { ColumnActionsMenu } from "@/features/columns/components/column-actions-menu";
import { ColumnEmptyState } from "@/features/columns/components/column-empty-state";
import { Column } from "@/features/columns/types/column.types";
import {
  Plus,
  GripVertical,
  Loader2,
  Edit3,
} from "lucide-react";

export default function Page() {
  const { activeWorkspace, isLoading: isWorkspaceLoading } = useWorkspaces();
  const { activeProject, isLoading: isProjectLoading } = useProjects();
  const { activeBoard, isLoading: isBoardLoading } = useBoards();
  const { data: columns = [], isLoading: isColumnsLoading } = useColumns(
    activeBoard?.id || null
  );
  const { mutateAsync: deleteColumn } = useDeleteColumn(activeBoard?.id || null);

  const { user } = useAuthStore();
  const { members } = useWorkspaceMembers(activeWorkspace?.id || null);

  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isColumnCreateOpen, setIsColumnCreateOpen] = React.useState(false);
  const [columnToEdit, setColumnToEdit] = React.useState<Column | null>(null);

  // Permission checks
  const currentUserMember = members.find((m) => m.user_id === user?.id);
  const role = currentUserMember?.role || "MEMBER";
  const canManageBoard = role === "OWNER" || role === "ADMIN";

  if (isWorkspaceLoading || isProjectLoading || isBoardLoading || isColumnsLoading) {
    return (
      <div className="flex justify-center items-center py-24 select-none">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!activeWorkspace) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] p-8 text-center rounded-xl border border-dashed border-border bg-card/40 animate-fade-in select-none">
        <h3 className="text-base font-semibold text-foreground mb-1">No Active Workspace</h3>
        <p className="text-xs text-muted-foreground max-w-sm mt-1">
          Select or create a workspace from the sidebar switcher to start.
        </p>
      </div>
    );
  }

  if (!activeProject) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] p-8 text-center rounded-xl border border-dashed border-border bg-card/40 animate-fade-in select-none">
        <h3 className="text-base font-semibold text-foreground mb-1">No Active Project</h3>
        <p className="text-xs text-muted-foreground max-w-sm mt-1">
          Select or create a project from the sidebar to view its board.
        </p>
      </div>
    );
  }

  if (!activeBoard) {
    return <BoardEmptyState />;
  }

  // Sorted columns based on their sequential position property
  const sortedColumns = [...columns].sort((a, b) => a.position - b.position);

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Board Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground/90">
            {activeBoard.name}
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
            {activeBoard.description || "No description provided."}
          </p>
        </div>
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {canManageBoard && (
            <button
              onClick={() => setIsEditOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-border text-foreground hover:bg-secondary text-xs font-semibold transition-all cursor-pointer animate-fade-in"
              aria-label="Edit board"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Board</span>
            </button>
          )}
          {canManageBoard && (
            <button
              onClick={() => setIsColumnCreateOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-colors cursor-pointer animate-fade-in"
              aria-label="Create new column"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Column</span>
            </button>
          )}
        </div>
      </div>

      {/* Board Column Flex Area or Empty State */}
      {sortedColumns.length === 0 ? (
        <ColumnEmptyState boardId={activeBoard.id} />
      ) : (
        <div className="flex-1 flex gap-4 overflow-x-auto min-h-0 pb-4">
          {sortedColumns.map((column) => (
            <div
              key={column.id}
              className="flex flex-col bg-secondary/40 rounded-xl border border-border p-4.5 space-y-4 min-w-[350px] flex-1 h-full overflow-hidden"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-0.5 select-none">
                <div className="flex items-center gap-2 min-w-0">
                  <GripVertical className="w-4 h-4 text-muted-foreground/30 shrink-0 cursor-not-allowed opacity-40" />
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: column.color || "#3b82f6" }}
                  />
                  <h3 className="text-lg font-bold text-foreground/90 truncate">
                    {column.name}
                  </h3>
                </div>
                <ColumnActionsMenu
                  canManage={canManageBoard}
                  onEdit={() => setColumnToEdit(column)}
                  onDelete={() => deleteColumn(column.id)}
                />
              </div>

              {/* Column Task Placeholder Area */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-0.5">
                <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border/70 rounded-xl bg-secondary/10 select-none">
                  <span className="text-xs font-semibold text-foreground/50">No tasks in column</span>
                  <span className="text-[10px] text-muted-foreground/60 mt-1 max-w-[180px]">
                    Tasks will be available in the next phase.
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialogs & Modals */}
      {isEditOpen && activeBoard && (
        <EditBoardModal
          board={activeBoard}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
        />
      )}

      {isColumnCreateOpen && activeBoard && (
        <CreateColumnModal
          boardId={activeBoard.id}
          isOpen={isColumnCreateOpen}
          onClose={() => setIsColumnCreateOpen(false)}
          nextPosition={columns.length}
        />
      )}

      {columnToEdit && activeBoard && (
        <EditColumnModal
          column={columnToEdit}
          boardId={activeBoard.id}
          isOpen={!!columnToEdit}
          onClose={() => setColumnToEdit(null)}
        />
      )}
    </div>
  );
}
