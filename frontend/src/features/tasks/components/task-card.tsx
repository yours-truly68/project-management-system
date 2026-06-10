"use client";

import * as React from "react";
import { Task, TaskPriority } from "../types/task.types";
import { WorkspaceMemberDetailed } from "@/features/workspaces/types/workspace.types";
import { Calendar, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  members: WorkspaceMemberDetailed[];
}

// Map priorities to colors & labels
const PRIORITY_MAP: Record<
  TaskPriority,
  { label: string; bg: string; text: string; dot: string }
> = {
  URGENT: { label: "Urgent", bg: "bg-rose-500/10", text: "text-rose-500", dot: "bg-rose-500" },
  HIGH: { label: "High", bg: "bg-amber-500/10", text: "text-amber-500", dot: "bg-amber-500" },
  MEDIUM: { label: "Medium", bg: "bg-sky-500/10", text: "text-sky-500", dot: "bg-sky-500" },
  LOW: { label: "Low", bg: "bg-secondary", text: "text-muted-foreground", dot: "bg-muted-foreground" },
};

function getInitials(name: string): string {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0][0]?.toUpperCase() || "";
}

export function TaskCard({ task, onClick, members }: TaskCardProps) {
  const assignee = React.useMemo(
    () => members.find((m) => m.user_id === task.assignee_id),
    [members, task.assignee_id]
  );

  const priority = PRIORITY_MAP[task.priority] || PRIORITY_MAP.MEDIUM;

  const isOverdue = React.useMemo(() => {
    if (!task.due_date) return false;
    return new Date(task.due_date) < new Date();
  }, [task.due_date]);

  const formattedDueDate = React.useMemo(() => {
    if (!task.due_date) return null;
    return new Date(task.due_date).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  }, [task.due_date]);

  return (
    <div
      onClick={onClick}
      className="group flex flex-col justify-between p-3.5 bg-card hover:bg-accent/10 border border-border hover:border-border-hover rounded-xl shadow-sm transition-all cursor-pointer select-none space-y-3"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`Task: ${task.title}`}
    >
      {/* Title */}
      <h4 className="text-xs font-bold text-foreground/90 leading-snug group-hover:text-foreground transition-colors line-clamp-2">
        {task.title}
      </h4>

      {/* Footer Info */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-2">
          {/* Priority */}
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border border-border/50",
              priority.bg,
              priority.text
            )}
          >
            <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", priority.dot)} />
            {priority.label}
          </span>

          {/* Due Date */}
          {formattedDueDate && (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 text-[10px] font-medium transition-colors",
                isOverdue
                  ? "text-rose-500 font-bold"
                  : "text-muted-foreground/80"
              )}
              title={isOverdue ? "Overdue task!" : "Due Date"}
            >
              {isOverdue ? (
                <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              ) : (
                <Calendar className="w-3.5 h-3.5 text-muted-foreground/45 shrink-0" />
              )}
              <span>{formattedDueDate}</span>
            </span>
          )}
        </div>

        {/* Assignee Avatar */}
        {assignee ? (
          <div
            className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 border border-primary/20 text-[9px] font-bold text-primary shrink-0 select-none"
            title={`Assigned to ${assignee.full_name}`}
          >
            {getInitials(assignee.full_name)}
          </div>
        ) : (
          <div
            className="w-5 h-5 rounded-full border border-dashed border-border/70 flex items-center justify-center text-[10px] text-muted-foreground/40 shrink-0 select-none"
            title="Unassigned"
          >
            —
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskCard;
