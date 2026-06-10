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
  columnName?: string;
}

// Soft background mapping based on name
function getTagStyles(name: string) {
  const norm = name.toLowerCase();
  if (norm.includes("design")) return "bg-lime-500/10 text-lime-400 border border-lime-500/20";
  if (norm.includes("todo") || norm.includes("backlog")) return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
  if (norm.includes("progress")) return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
  if (norm.includes("review")) return "bg-purple-500/10 text-purple-400 border border-purple-500/20";
  if (norm.includes("done")) return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
  return "bg-slate-500/10 text-slate-400 border border-slate-500/20";
}

// Map priorities to colors & labels
const PRIORITY_MAP: Record<
  TaskPriority,
  { label: string; bg: string; text: string; dot: string }
> = {
  URGENT: { label: "Urgent", bg: "bg-red-500/10 border border-red-500/20", text: "text-red-400", dot: "bg-red-500" },
  HIGH: { label: "High", bg: "bg-orange-500/10 border border-orange-500/20", text: "text-orange-400", dot: "bg-orange-500" },
  MEDIUM: { label: "Medium", bg: "bg-amber-500/10 border border-amber-500/20", text: "text-amber-400", dot: "bg-amber-500" },
  LOW: { label: "Low", bg: "bg-emerald-500/10 border border-emerald-500/20", text: "text-emerald-400", dot: "bg-emerald-500" },
};

function getInitials(name: string): string {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0][0]?.toUpperCase() || "";
}

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

export function TaskCard({ task, onClick, members, boardId, columnName }: TaskCardProps) {
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

  const renderAssigneeAvatar = () => {
    if (!assignee) {
      return null;
    }
    return (
      <div
        className={cn(
          "flex items-center justify-center w-[22px] h-[22px] rounded-full border text-[9px] font-bold shrink-0 select-none transition-all",
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
      className="group relative flex flex-col p-4 bg-card border border-[#242B36] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.45)] hover:border-primary/45 hover:shadow-lg hover:-translate-y-[1.5px] transition-all duration-200 cursor-pointer select-none space-y-3"
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
      {/* 1. Tags Row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Status/Category Pill (Column Name) */}
          {columnName && (
            <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider", getTagStyles(columnName))}>
              {columnName}
            </span>
          )}

          {/* Priority Pill */}
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider",
              priority.bg,
              priority.text
            )}
          >
            <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", priority.dot)} />
            {priority.label}
          </span>

          {/* Optional Due Date tag */}
          {formattedDueDate && (
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border",
                isOverdue
                  ? "bg-rose-500/10 text-rose-400 border-rose-500/20 font-bold"
                  : "bg-secondary text-muted-foreground/80 border-border/40"
              )}
              title={isOverdue ? "Overdue task!" : "Due Date"}
            >
              <Clock className={cn("w-3 h-3 shrink-0", isOverdue ? "text-rose-500" : "text-muted-foreground/50")} />
              <span>{formattedDueDate}</span>
            </span>
          )}
        </div>

        {/* Actions menu */}
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
            <div className="absolute right-0 mt-1.5 w-32 rounded-lg border border-[#242B36] bg-[#1B212B] shadow-[0_20px_40px_rgba(0,0,0,0.45)] py-1 z-[9999] animate-fade-in focus:outline-none text-left select-none">
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

      {/* 2. Middle Section (Title & Description) */}
      <div className="space-y-1">
        <h4 className="text-[16px] font-semibold text-foreground leading-snug group-hover:text-foreground transition-colors break-words">
          {task.title}
        </h4>
        {task.description && (
          <p className="text-sm text-muted-foreground/75 leading-relaxed line-clamp-2 break-words">
            {task.description}
          </p>
        )}
      </div>

      {/* 3. Media Preview Row (Hidden when no attachments present to avoid fake data) */}

      {/* 4. Divider */}
      <div className="border-t border-[#242B36] my-1" />

      {/* 5. Footer Metadata */}
      <div className="flex items-center justify-between w-full h-[22px]">
        {/* Left: Assignee avatars */}
        <div className="flex items-center gap-1">
          {renderAssigneeAvatar()}
        </div>

        {/* Right: Comments/Attachments counts (only populated if real data exists) */}
        <div className="flex items-center gap-2.5 text-muted-foreground/50">
          {/* Reserved for future comments/attachments stats */}
        </div>
      </div>
    </div>
  );
}

export default TaskCard;
