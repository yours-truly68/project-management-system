"use client";

import * as React from "react";
import { Plus, Calendar, User, ChevronRight, ChevronDown } from "lucide-react";
import { Column } from "@/features/columns/types/column.types";
import { Task } from "@/features/tasks/types/task.types";
import { WorkspaceMemberDetailed } from "@/features/workspaces/types/workspace.types";
import { cn } from "@/lib/utils";

interface ListViewProps {
  columns: Column[];
  tasksByColumn: Record<string, Task[]>;
  members: WorkspaceMemberDetailed[];
  canManageBoard: boolean;
  onAddTask: (columnId: string) => void;
  onSelectTask: (task: Task) => void;
  getColumnColor: (name: string, defaultColor: string | null) => string;
}

export function ListView({
  columns,
  tasksByColumn,
  members,
  canManageBoard,
  onAddTask,
  onSelectTask,
  getColumnColor,
}: ListViewProps) {
  const [collapsedColumns, setCollapsedColumns] = React.useState<Record<string, boolean>>({});

  const sortedColumns = React.useMemo(() => {
    return [...columns].sort((a, b) => a.position - b.position);
  }, [columns]);

  const toggleColumnCollapse = (columnId: string) => {
    setCollapsedColumns((prev) => ({
      ...prev,
      [columnId]: !prev[columnId],
    }));
  };

  const getAssignee = (assigneeId: string | null) => {
    if (!assigneeId) return null;
    return members.find((m) => m.user_id === assigneeId) || null;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      case "HIGH":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "MEDIUM":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "LOW":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default:
        return "bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20";
    }
  };

  const formatDueDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  if (sortedColumns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] p-8 text-center rounded-xl border border-dashed border-border bg-card/20 select-none">
        <h3 className="text-base font-semibold text-foreground mb-1">No Columns Available</h3>
        <p className="text-xs text-muted-foreground max-w-sm mt-1">
          Create a column first to begin listing tasks.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto space-y-6 pr-1 select-none animate-fade-in">
      {sortedColumns.map((column) => {
        const isCollapsed = !!collapsedColumns[column.id];
        const columnTasks = tasksByColumn[column.id] || [];
        const colColor = getColumnColor(column.name, column.color);

        return (
          <div key={column.id} className="border border-border/60 rounded-xl overflow-hidden bg-card/20">
            {/* Column Header Panel */}
            <div
              className="flex items-center justify-between px-4 py-3 bg-column-surface border-b border-border/40 cursor-pointer hover:bg-column-surface/80 transition-colors"
              onClick={() => toggleColumnCollapse(column.id)}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <button className="text-muted-foreground/60 hover:text-foreground transition-colors p-0.5 rounded">
                  {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: colColor }} />
                <h3 className="text-[14px] font-bold text-foreground/90 tracking-tight truncate flex items-center gap-2">
                  <span>{column.name}</span>
                  <span className="text-[11px] font-semibold text-secondary-text px-1.5 py-0.2 rounded-full bg-background/50 border border-border/30 font-mono">
                    {columnTasks.length}
                  </span>
                </h3>
              </div>
              {canManageBoard && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddTask(column.id);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded bg-primary/10 text-primary hover:bg-primary/25 transition-all cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Task</span>
                </button>
              )}
            </div>

            {/* Tasks List Panel */}
            {!isCollapsed && (
              <div className="divide-y divide-border/40">
                {columnTasks.length === 0 ? (
                  <div className="px-5 py-6 text-center text-xs text-muted-foreground/50">
                    No tasks in this stage
                  </div>
                ) : (
                  [...columnTasks]
                    .sort((a, b) => a.position - b.position)
                    .map((task) => {
                    const assignee = getAssignee(task.assignee_id);
                    const formattedDate = formatDueDate(task.due_date);

                    return (
                      <div
                        key={task.id}
                        onClick={() => onSelectTask(task)}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 hover:bg-card-hover/40 transition-colors cursor-pointer"
                      >
                        {/* Task Title */}
                        <div className="min-w-0 flex-1">
                          <p className="text-[14px] font-semibold text-foreground/90 leading-snug hover:text-primary transition-colors">
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="text-xs text-muted-foreground truncate mt-1 max-w-xl">
                              {task.description}
                            </p>
                          )}
                        </div>

                        {/* Task Attributes */}
                        <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
                          {/* Priority */}
                          <span
                            className={cn(
                              "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border select-none",
                              getPriorityStyles(task.priority)
                            )}
                          >
                            {task.priority}
                          </span>

                          {/* Assignee */}
                          <div className="flex items-center gap-1.5 text-xs text-secondary-text min-w-[100px]">
                            {assignee ? (
                              <>
                                <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">
                                  {getInitials(assignee.full_name)}
                                </div>
                                <span className="truncate max-w-[80px]" title={assignee.full_name}>
                                  {assignee.full_name}
                                </span>
                              </>
                            ) : (
                              <>
                                <User className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                                <span className="text-muted-foreground/55 italic">Unassigned</span>
                              </>
                            )}
                          </div>

                          {/* Due Date */}
                          <div className="flex items-center gap-1 text-xs text-secondary-text min-w-[70px]">
                            <Calendar className="w-3.5 h-3.5 text-muted-foreground/45 shrink-0" />
                            {formattedDate ? (
                              <span className="font-medium">{formattedDate}</span>
                            ) : (
                              <span className="text-muted-foreground/40">-</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ListView;
