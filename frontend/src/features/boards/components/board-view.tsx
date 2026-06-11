"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Column } from "@/features/columns/types/column.types";
import { Task } from "@/features/tasks/types/task.types";
import { WorkspaceMemberDetailed } from "@/features/workspaces/types/workspace.types";
import { ColumnActionsMenu } from "@/features/columns/components/column-actions-menu";
import { TaskCard } from "@/features/tasks/components/task-card";
import { ColumnEmptyState } from "@/features/columns/components/column-empty-state";

interface BoardViewProps {
  boardId: string;
  columns: Column[];
  tasksByColumn: Record<string, Task[]>;
  members: WorkspaceMemberDetailed[];
  canManageBoard: boolean;
  onEditColumn: (column: Column) => void;
  onDeleteColumn: (columnId: string) => void;
  onAddTask: (columnId: string) => void;
  onSelectTask: (task: Task) => void;
  getColumnColor: (name: string, defaultColor: string | null) => string;
}

export function BoardView({
  boardId,
  columns,
  tasksByColumn,
  members,
  canManageBoard,
  onEditColumn,
  onDeleteColumn,
  onAddTask,
  onSelectTask,
  getColumnColor,
}: BoardViewProps) {
  const sortedColumns = React.useMemo(() => {
    return [...columns].sort((a, b) => a.position - b.position);
  }, [columns]);

  if (sortedColumns.length === 0) {
    return <ColumnEmptyState boardId={boardId} />;
  }

  return (
    <div className="flex-1 flex gap-4 overflow-x-auto min-h-0 pb-3 select-none">
      {sortedColumns.map((column) => (
        <div
          key={column.id}
          className="flex flex-col bg-column-surface rounded-[18px] border border-border p-4 space-y-4 w-[360px] shrink-0 h-full overflow-hidden shadow-sm animate-fade-in"
        >
          {/* Column Header */}
          <div className="flex items-center justify-between pb-1 select-none shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: getColumnColor(column.name, column.color) }}
              />
              <h3 className="text-base font-bold text-foreground/90 tracking-tight truncate flex items-center gap-2">
                <span>{column.name}</span>
                <span className="text-xs font-semibold text-secondary-text px-2 py-0.5 rounded-full bg-background/50 border border-border/40 font-mono">
                  {tasksByColumn[column.id]?.length || 0}
                </span>
              </h3>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <ColumnActionsMenu
                canManage={canManageBoard}
                onEdit={() => onEditColumn(column)}
                onDelete={() => onDeleteColumn(column.id)}
              />
            </div>
          </div>

          {/* Add Task CTA (Directly below column header) */}
          {canManageBoard && (
            <button
              onClick={() => onAddTask(column.id)}
              className="w-full h-11 bg-accent border border-border hover:bg-card-hover rounded-xl flex items-center justify-center transition-all text-foreground hover:text-foreground cursor-pointer shrink-0 gap-2 text-sm font-semibold"
              aria-label="Add Task"
            >
              <Plus className="w-4 h-4 text-foreground/80" />
              <span>Add Task</span>
            </button>
          )}

          {/* Column Task List Area */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-0.5 min-h-0">
            {!tasksByColumn[column.id] || tasksByColumn[column.id].length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 border border-dashed border-border/30 rounded-xl select-none text-center h-full justify-center my-auto">
                <span className="text-sm font-semibold text-muted-foreground/50">No tasks in this stage</span>
              </div>
            ) : (
              <div className="space-y-3">
                {tasksByColumn[column.id].map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    columnName={column.name}
                    onClick={() => onSelectTask(task)}
                    members={members}
                    boardId={boardId}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default BoardView;
