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
  Loader2,
  Edit3,
  Archive,
} from "lucide-react";
import { useProjectStore } from "@/stores/project.store";
import { useUpdateProject } from "@/features/projects/hooks/use-projects";
import { useTasks } from "@/features/tasks/hooks/use-tasks";
import { TaskCard } from "@/features/tasks/components/task-card";
import { CreateTaskModal } from "@/features/tasks/components/create-task-modal";
import { TaskDetailsDrawer } from "@/features/tasks/components/task-details-drawer";
import { Task } from "@/features/tasks/types/task.types";

export default function Page() {
  const { activeWorkspace, isLoading: isWorkspaceLoading } = useWorkspaces();
  const { activeProject, isLoading: isProjectLoading } = useProjects();
  const { activeBoard, isLoading: isBoardLoading } = useBoards();
  const { data: columns = [], isLoading: isColumnsLoading } = useColumns(
    activeBoard?.id || null
  );
  const { mutateAsync: deleteColumn } = useDeleteColumn(activeBoard?.id || null);

  // Fetch tasks for the active board
  const { data: tasks = [], isLoading: isTasksLoading } = useTasks(activeBoard?.id || null);

  const { user } = useAuthStore();
  const { members } = useWorkspaceMembers(activeWorkspace?.id || null);

  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isColumnCreateOpen, setIsColumnCreateOpen] = React.useState(false);
  const [columnToEdit, setColumnToEdit] = React.useState<Column | null>(null);

  // Task quick-create and details drawer states
  const [taskToCreateColId, setTaskToCreateColId] = React.useState<string | null>(null);
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);

  const archivedEntity = useProjectStore((s) => s.archivedEntity);
  const setArchivedEntity = useProjectStore((s) => s.setArchivedEntity);

  const { mutateAsync: updateProject, isPending: isRestoring } = useUpdateProject(archivedEntity?.id || "");

  // Group tasks client-side by column_id and sort by position ascending
  const tasksByColumn = React.useMemo(() => {
    const groups: Record<string, Task[]> = {};
    columns.forEach((col) => {
      groups[col.id] = [];
    });
    tasks.forEach((task) => {
      if (groups[task.column_id]) {
        groups[task.column_id].push(task);
      }
    });
    Object.keys(groups).forEach((colId) => {
      groups[colId].sort((a, b) => a.position - b.position);
    });
    return groups;
  }, [columns, tasks]);

  const handleRestore = async () => {
    if (!archivedEntity) return;
    try {
      await updateProject({ is_archived: false });
      const { setActiveProjectId } = useProjectStore.getState();
      setActiveProjectId(archivedEntity.id);
      setArchivedEntity(null);
    } catch (err) {
      console.error("Failed to restore archived project:", err);
    }
  };

  // Permission checks
  const currentUserMember = members.find((m) => m.user_id === user?.id);
  const role = currentUserMember?.role || "MEMBER";
  const canManageBoard = role === "OWNER" || role === "ADMIN";

  if (isWorkspaceLoading || isProjectLoading || isBoardLoading || isColumnsLoading || isTasksLoading) {
    return (
      <div className="flex flex-col h-full space-y-4">
        {/* Board Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-secondary rounded-lg animate-pulse" />
            <div className="h-4 w-96 bg-secondary rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-2.5 h-10 w-48 bg-secondary rounded-lg animate-pulse" />
        </div>

        {/* Columns & Cards Skeleton */}
        <div className="flex-1 flex gap-3 overflow-x-auto min-h-0 pb-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex flex-col bg-secondary/80 rounded-xl border border-border/50 p-3.5 space-y-3.5 w-[340px] shrink-0 h-full overflow-hidden animate-pulse"
            >
              {/* Column Header Shimmer */}
              <div className="flex items-center justify-between pb-0.5">
                <div className="flex items-center gap-2.5 w-1/2">
                  <div className="w-2 h-2 rounded-full bg-secondary shrink-0" />
                  <div className="h-5 bg-secondary rounded w-28" />
                </div>
                <div className="w-6 h-6 bg-secondary rounded" />
              </div>

              {/* Add Task CTA Shimmer */}
              <div className="w-full h-12 bg-secondary/50 rounded-xl" />

              {/* Tasks Shimmer list */}
              <div className="flex-1 space-y-2">
                {[1, 2].map((j) => (
                  <div
                    key={j}
                    className="p-3 border border-border/80 bg-card rounded-xl space-y-2.5 shadow-xs"
                  >
                    <div className="h-3 w-10 bg-secondary rounded" />
                    <div className="space-y-1.5">
                      <div className="h-3.5 bg-secondary rounded w-5/6" />
                      <div className="h-3 bg-secondary rounded w-3/4" />
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border/40">
                      <div className="h-4 bg-secondary rounded w-16" />
                      <div className="w-5 h-5 rounded-full bg-secondary" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
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

  if (archivedEntity) {
    const isProject = archivedEntity.type === "project";
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] p-8 text-center rounded-xl border border-dashed border-border bg-card/40 animate-fade-in select-none max-w-xl mx-auto my-12">
        <Archive className="w-10 h-10 text-amber-500 mb-4 shrink-0" />
        <h3 className="text-lg font-bold text-foreground mb-1">
          {isProject ? "Project" : "Board"} Archived
        </h3>
        <p className="text-xs text-muted-foreground max-w-sm mt-1.5 leading-relaxed">
          The {archivedEntity.type} <span className="font-semibold text-foreground">&quot;{archivedEntity.name}&quot;</span> has been archived. You cannot edit it or add columns/tasks while it remains archived.
        </p>
        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={handleRestore}
            disabled={isRestoring}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isRestoring && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Restore {isProject ? "Project" : "Board"}
          </button>
          <button
            onClick={() => setArchivedEntity(null)}
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-border text-foreground hover:bg-secondary transition-colors cursor-pointer"
          >
            Dismiss
          </button>
        </div>
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
        <div className="flex-1 flex gap-3 overflow-x-auto min-h-0 pb-3">
          {sortedColumns.map((column) => (
            <div
              key={column.id}
              className="flex flex-col bg-secondary/80 rounded-xl border border-border/50 p-3.5 space-y-3.5 w-[340px] shrink-0 h-full overflow-hidden"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-1 select-none">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: column.color || "#3b82f6" }}
                  />
                  <h3 className="text-sm font-bold text-foreground/90 tracking-tight truncate flex items-center gap-1.5">
                    <span className="font-bold text-foreground/95">{column.name}</span>
                    <span className="text-xs font-semibold text-muted-foreground/60">
                      {tasksByColumn[column.id]?.length || 0}
                    </span>
                  </h3>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <ColumnActionsMenu
                    canManage={canManageBoard}
                    onEdit={() => setColumnToEdit(column)}
                    onDelete={() => deleteColumn(column.id)}
                  />
                </div>
              </div>

              {/* Add Task CTA (Directly below column header) */}
              {canManageBoard && (
                <button
                  onClick={() => setTaskToCreateColId(column.id)}
                  className="w-full h-12 bg-card/45 dark:bg-card/25 border border-border/60 hover:border-border hover:bg-secondary rounded-xl flex items-center justify-center transition-all text-muted-foreground/65 hover:text-foreground cursor-pointer shrink-0"
                  aria-label="Add Task"
                >
                  <Plus className="w-4.5 h-4.5" />
                </button>
              )}

              {/* Column Task List Area */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-0.5 min-h-0">
                {!tasksByColumn[column.id] || tasksByColumn[column.id].length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-14 px-4 border border-dashed border-border/30 rounded-xl bg-card/20 select-none text-center h-full justify-center my-auto space-y-3">
                    <span className="text-xs font-semibold text-muted-foreground/50">No tasks yet</span>
                    <button
                      onClick={() => setTaskToCreateColId(column.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-card border border-border hover:bg-secondary text-foreground transition-all cursor-pointer shadow-xs hover:shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create First Task</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {tasksByColumn[column.id].map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onClick={() => setSelectedTask(task)}
                        members={members}
                        boardId={activeBoard.id}
                      />
                    ))}
                  </div>
                )}
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

      {taskToCreateColId && activeBoard && (
        <CreateTaskModal
          boardId={activeBoard.id}
          columnId={taskToCreateColId}
          isOpen={!!taskToCreateColId}
          onClose={() => setTaskToCreateColId(null)}
          nextPosition={tasksByColumn[taskToCreateColId]?.length || 0}
          members={members}
        />
      )}

      {selectedTask && activeBoard && (
        <TaskDetailsDrawer
          task={selectedTask}
          boardId={activeBoard.id}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          members={members}
        />
      )}
    </div>
  );
}
