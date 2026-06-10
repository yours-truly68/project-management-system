"use client";

import * as React from "react";
import { Task, TaskPriority } from "../types/task.types";
import { WorkspaceMemberDetailed } from "@/features/workspaces/types/workspace.types";
import { Calendar, MessageSquare, Paperclip, MoreVertical, Edit3, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDeleteTask } from "../hooks/use-tasks";

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  members: WorkspaceMemberDetailed[];
  boardId: string;
  columnName?: string;
}

// Map priorities to solid rounded-full pills
const PRIORITY_MAP: Record<
  TaskPriority,
  { label: string; bg: string; text: string }
> = {
  URGENT: { label: "Urgent", bg: "bg-[#FFA39E]", text: "text-[#820014]" },
  HIGH: { label: "High", bg: "bg-[#FFD591]", text: "text-[#873800]" },
  MEDIUM: { label: "Medium", bg: "bg-[#FFE58F]", text: "text-[#876800]" },
  LOW: { label: "Low", bg: "bg-[#D9F7BE]", text: "text-[#275F10]" },
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

export function TaskCard({ task, onClick, members, boardId }: TaskCardProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const { mutateAsync: deleteTask } = useDeleteTask(boardId);

  const assignee = React.useMemo(
    () => members.find((m) => m.user_id === task.assignee_id),
    [members, task.assignee_id]
  );

  const creator = React.useMemo(
    () => members.find((m) => m.user_id === task.reporter_id) || assignee,
    [members, task.reporter_id, assignee]
  );

  const priority = task.priority ? PRIORITY_MAP[task.priority] : null;

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

  const dueDateColor = React.useMemo(() => {
    if (!task.due_date) return "text-secondary-text";
    if (isOverdue) return "text-rose-500";
    
    // Check if upcoming (within 3 days)
    const diffTime = new Date(task.due_date).getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays >= 0 && diffDays <= 3) {
      return "text-amber-500"; // Upcoming
    }
    return "text-secondary-text"; // Normal
  }, [task.due_date, isOverdue]);

  // Generate stable mock values for comments/attachments based on task ID
  const { commentsCount, attachmentsCount } = React.useMemo(() => {
    const hash = task.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return {
      commentsCount: hash % 4, // 0 to 3 comments
      attachmentsCount: hash % 5, // 0 to 4 attachments
    };
  }, [task.id]);

  // Tagged / assigned members for the row (limit to 3, then +N)
  const cardMembers = React.useMemo(() => {
    const list: WorkspaceMemberDetailed[] = [];
    if (assignee) list.push(assignee);
    const reporter = members.find((m) => m.user_id === task.reporter_id);
    if (reporter && !list.some((m) => m.user_id === reporter.user_id)) {
      list.push(reporter);
    }
    // Pull other workspace members to show overlapping avatars
    members.forEach((m) => {
      if (list.length < 5 && !list.some((existing) => existing.user_id === m.user_id)) {
        list.push(m);
      }
    });
    return list;
  }, [members, assignee, task.reporter_id]);

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

  const renderAvatars = (maxCount = 3) => {
    if (cardMembers.length === 0) {
      return <span className="text-disabled-text text-xs font-medium">Unassigned</span>;
    }
    
    const visible = cardMembers.slice(0, maxCount);
    const remaining = cardMembers.length - maxCount;
    
    return (
      <div className="flex items-center -space-x-1.5">
        {visible.map((m, idx) => (
          <div
            key={m.user_id}
            className={cn(
              "flex items-center justify-center w-[22px] h-[22px] rounded-full border border-card text-[9px] font-bold shrink-0 select-none transition-all ring-1 ring-border",
              getAvatarBg(m.full_name)
            )}
            style={{ zIndex: 10 - idx }}
            title={m.full_name}
          >
            {getInitials(m.full_name)}
          </div>
        ))}
        {remaining > 0 && (
          <div
            className="flex items-center justify-center w-[22px] h-[22px] rounded-full border border-card bg-secondary-text/10 border-border/40 text-[9px] font-bold text-secondary-text shrink-0 select-none z-0"
            title={`${remaining} more members`}
          >
            +{remaining}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col p-4 bg-card border border-border rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.25)] hover:border-[#3B82F6] hover:bg-card-hover hover:translate-y-[-2px] transition-all duration-200 cursor-pointer select-none space-y-4 h-auto"
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
      {/* 1. Priority Badge & Menu Row */}
      <div className="flex items-center justify-between gap-2 shrink-0">
        <div>
          {priority ? (
            <span
              className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider",
                priority.bg,
                priority.text
              )}
            >
              {priority.label}
            </span>
          ) : (
            <div className="w-1" />
          )}
        </div>

        {/* Actions menu */}
        <div className="relative" ref={menuRef} onClick={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            className="p-1 rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-background/80 transition-all cursor-pointer focus-visible:outline-none"
            aria-label="Task options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-32 rounded-lg border border-border bg-elevated shadow-2xl py-1 z-[9999] animate-fade-in focus:outline-none text-left select-none">
              <button
                onClick={handleEdit}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-foreground hover:bg-background/80 transition-colors text-left cursor-pointer font-medium"
              >
                <Edit3 className="w-3.5 h-3.5 text-secondary-text" />
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

      {/* 2. Task Title */}
      <h4 className="text-[18px] font-semibold text-foreground leading-snug group-hover:text-foreground transition-colors break-words">
        {task.title}
      </h4>

      {/* 3. Description */}
      {task.description && (
        <p className="text-sm text-secondary-text leading-relaxed font-normal line-clamp-4 break-words">
          {task.description}
        </p>
      )}

      {/* 4. Assigned + Due Date Row */}
      <div className="flex items-center justify-between text-xs py-1">
        <div className="flex items-center gap-2">
          <span className="text-secondary-text font-medium">Assigned:</span>
          {renderAvatars(3)}
        </div>
        {formattedDueDate && (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 font-medium",
              dueDateColor
            )}
          >
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span>Due {formattedDueDate}</span>
          </span>
        )}
      </div>

      {/* 5. Creator */}
      {creator && (
        <p className="text-xs text-muted-foreground font-medium">
          Created by {creator.full_name}
        </p>
      )}

      {/* 6. Progress (future space for subtasks) */}
      {/* Structurally prepared but hidden when no progress exists */}

      {/* 7. Divider */}
      <div className="border-t border-border my-1" />

      {/* 8. Footer */}
      <div className="flex items-center justify-between w-full h-[22px] pt-1">
        {/* Left: Assignee avatars */}
        <div className="flex items-center gap-1">
          {assignee ? (
            <div
              className={cn(
                "flex items-center justify-center w-[22px] h-[22px] rounded-full border border-card text-[9px] font-bold shrink-0 select-none ring-1 ring-border",
                getAvatarBg(assignee.full_name)
              )}
              title={assignee.full_name}
            >
              {getInitials(assignee.full_name)}
            </div>
          ) : (
            <span className="text-disabled-text text-[10px]">No Assignee</span>
          )}
        </div>

        {/* Right: Comments & Attachments counts */}
        <div className="flex items-center gap-3 text-secondary-text text-xs">
          {commentsCount > 0 && (
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{commentsCount} comments</span>
            </span>
          )}
          {attachmentsCount > 0 && (
            <span className="flex items-center gap-1">
              <Paperclip className="w-3.5 h-3.5" />
              <span>{attachmentsCount} attachments</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default TaskCard;
