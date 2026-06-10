"use client";

import * as React from "react";
import { Task, TaskPriority } from "../types/task.types";
import { WorkspaceMemberDetailed } from "@/features/workspaces/types/workspace.types";
import { Clock, MoreHorizontal, Edit3, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDeleteTask } from "../hooks/use-tasks";

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  members: WorkspaceMemberDetailed[];
  boardId: string;
}

interface TaskCardMetaProps {
  left?: React.ReactNode;
  right?: React.ReactNode;
}

// Reusable metadata component prepared for comments, attachments, etc.
export function TaskCardMeta({ left, right }: TaskCardMetaProps) {
  return (
    <div className="flex items-center justify-between w-full mt-2 pt-2 border-t border-border/40">
      {/* Left Metadata Slots (Due dates, future comments, attachments, checklists) */}
      <div className="flex items-center gap-2 text-muted-foreground min-w-0 flex-1">
        {left}
        {/* Future Slots: Comments, Attachments, Subtasks, Activity */}
      </div>
      {/* Right Metadata Slots (Assignees, labels, flags) */}
      <div className="flex items-center gap-1.5 shrink-0">
        {right}
      </div>
    </div>
  );
}

// Map priorities to colors & labels
const PRIORITY_MAP: Record<
  TaskPriority,
  { label: string; bg: string; text: string; dot: string }
> = {
  URGENT: { label: "Urgent", bg: "bg-red-500/10 dark:bg-red-500/10", text: "text-red-500", dot: "bg-red-500" },
  HIGH: { label: "High", bg: "bg-amber-500/10 dark:bg-amber-500/10", text: "text-amber-500", dot: "bg-amber-500" },
  MEDIUM: { label: "Medium", bg: "bg-blue-500/10 dark:bg-blue-500/10", text: "text-blue-500", dot: "bg-blue-500" },
  LOW: { label: "Low", bg: "bg-neutral-100 dark:bg-neutral-800", text: "text-neutral-500 dark:text-neutral-400", dot: "bg-neutral-400 dark:bg-neutral-500" },
};

function getInitials(name: string): string {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0][0]?.toUpperCase() || "";
}

// Helper to generate deterministic bg color for assignee initials fallback
function getAvatarBg(name: string): string {
  const colors = [
    "bg-red-500/10 text-red-500 border-red-500/20",
    "bg-orange-500/10 text-orange-500 border-orange-500/20",
    "bg-amber-500/10 text-amber-500 border-amber-500/20",
    "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    "bg-teal-500/10 text-teal-500 border-teal-500/20",
    "bg-sky-500/10 text-sky-500 border-sky-500/20",
    "bg-blue-500/10 text-blue-500 border-blue-500/20",
    "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    "bg-purple-500/10 text-purple-500 border-purple-500/20",
    "bg-fuchsia-500/10 text-fuchsia-500 border-fuchsia-500/20",
    "bg-pink-500/10 text-pink-500 border-pink-500/20",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

export function TaskCard({ task, onClick, members, boardId }: TaskCardProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const { mutateAsync: deleteTask } = useDeleteTask(boardId);

  const assignee = React.useMemo(
    () => members.find((m) => m.user_id === task.assignee_id),
    [members, task.assignee_id]
  );

  const priority = PRIORITY_MAP[task.priority] || PRIORITY_MAP.MEDIUM;

  const isOverdue = React.useMemo(() => {
    if (!task.due_date) return false;
    // Set hours to end of day to make check nicer
    const d = new Date(task.due_date);
    d.setHours(23, 59, 59, 999);
    return d < new Date();
  }, [task.due_date]);

  const formattedDueDate = React.useMemo(() => {
    if (!task.due_date) return null;
    return new Date(task.due_date).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  }, [task.due_date]);

  // Handle outside menu click
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

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    if (confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask(task.id);
      } catch (err) {
        console.error("Failed to delete task:", err);
      }
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    onClick();
  };

  // Due date rendering helper
  const renderDueDate = () => {
    if (!formattedDueDate) return null;
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium transition-all duration-150 border",
          isOverdue
            ? "bg-rose-500/10 text-rose-500 border-rose-500/20 font-bold"
            : "bg-secondary text-muted-foreground/80 border-border/40"
        )}
        title={isOverdue ? "Overdue task!" : "Due Date"}
      >
        <Clock className={cn("w-3 h-3 shrink-0", isOverdue ? "text-rose-500" : "text-muted-foreground/50")} />
        <span>{formattedDueDate}</span>
      </span>
    );
  };

  // Assignee Avatar rendering helper
  const renderAssigneeAvatar = () => {
    if (!assignee) {
      return (
        <div
          className="w-5 h-5 rounded-full border border-dashed border-border/80 flex items-center justify-center text-[10px] text-muted-foreground/30 shrink-0 select-none"
          title="Unassigned"
        >
          —
        </div>
      );
    }
    return (
      <div
        className={cn(
          "flex items-center justify-center w-5 h-5 rounded-full border text-[9px] font-bold shrink-0 select-none transition-all",
          getAvatarBg(assignee.full_name)
        )}
        title={assignee.full_name}
      >
        {getInitials(assignee.full_name)}
      </div>
    );
  };

  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col p-3 bg-card border border-border/80 dark:border-border/60 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.02)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.45)] hover:border-primary/40 dark:hover:border-primary/45 hover:shadow-md dark:hover:shadow-[0_4px_12px_rgba(0,0,0,0.55)] hover:-translate-y-[1.5px] transition-all duration-200 cursor-pointer select-none space-y-2.5"
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
      {/* Header: Priority Badge & Always Visible Overflow Actions */}
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider border border-border/40",
            priority.bg,
            priority.text
          )}
        >
          <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", priority.dot)} />
          {priority.label}
        </span>

        {/* Overflow Menu (Always visible) */}
        <div className="relative" ref={menuRef} onClick={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            className="p-1 rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-secondary transition-all cursor-pointer focus-visible:outline-none"
            aria-label="Task options"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-1 w-32 rounded-lg border border-border bg-elevated shadow-lg py-1 z-20 animate-fade-in focus:outline-none text-left select-none">
              <button
                onClick={handleEdit}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-foreground hover:bg-secondary transition-colors text-left cursor-pointer font-medium"
              >
                <Edit3 className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Edit Task</span>
              </button>
              <button
                onClick={handleDelete}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-500 hover:bg-rose-500/10 transition-colors text-left cursor-pointer font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Task</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Task Content */}
      <div className="space-y-1">
        <h4 className="text-[13px] font-semibold text-foreground/90 leading-snug group-hover:text-foreground transition-colors break-words">
          {task.title}
        </h4>
        {task.description && (
          <p className="text-[11px] text-muted-foreground/75 leading-relaxed line-clamp-2 break-words">
            {task.description}
          </p>
        )}
      </div>

      {/* Reusable Metadata Row */}
      <TaskCardMeta
        left={renderDueDate()}
        right={renderAssigneeAvatar()}
      />
    </div>
  );
}

export default TaskCard;

