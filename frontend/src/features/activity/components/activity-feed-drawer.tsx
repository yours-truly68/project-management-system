"use client";

import * as React from "react";
import { X, Clock, History, User } from "lucide-react";
import { useActivities } from "../hooks/use-activities";
import { Activity } from "../types/activity.types";

interface ActivityFeedDrawerProps {
  workspaceId: string;
  projectId?: string | null;
  boardId?: string | null;
  isOpen: boolean;
  onClose: () => void;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 10) return "just now";
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ActivityFeedDrawer({
  workspaceId,
  projectId,
  boardId,
  isOpen,
  onClose,
}: ActivityFeedDrawerProps) {
  const { data: activities = [], isLoading } = useActivities(
    isOpen ? workspaceId : null,
    projectId,
    boardId
  );

  // Close drawer on escape key press
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const renderActivityText = (activity: Activity) => {
    const meta = activity.metadata || {};
    const actorName = activity.actor?.full_name || activity.actor?.username || "Someone";
    const bold = (txt?: string) => <span className="font-semibold text-foreground">{txt || "unknown"}</span>;

    switch (activity.action) {
      case "TASK_CREATED":
        return (
          <span>
            {actorName} created task {bold(meta.task_title)}
          </span>
        );
      case "TASK_DELETED":
        return (
          <span>
            {actorName} deleted task {bold(meta.task_title)}
          </span>
        );
      case "TASK_ASSIGNED":
        return (
          <span>
            {actorName} assigned {bold(meta.assignee_name)} to {bold(meta.task_title)}
          </span>
        );
      case "TASK_UNASSIGNED":
        return (
          <span>
            {actorName} unassigned {bold(meta.task_title)}
          </span>
        );
      case "TASK_PRIORITY_CHANGED":
        return (
          <span>
            {actorName} changed priority of {bold(meta.task_title)}:{" "}
            <span className="text-secondary-text font-medium">{meta.from_priority || "none"}</span>{" "}
            <span className="text-muted-foreground/60 font-mono">→</span>{" "}
            <span className="text-foreground font-semibold">{meta.to_priority || "none"}</span>
          </span>
        );
      case "TASK_DUE_DATE_CHANGED":
        return (
          <span>
            {actorName} changed due date of {bold(meta.task_title)}
          </span>
        );
      case "TASK_MOVED":
        return (
          <span>
            {actorName} moved {bold(meta.task_title)} from {bold(meta.from_column)} to {bold(meta.to_column)}
          </span>
        );
      case "COLUMN_CREATED":
        return (
          <span>
            {actorName} created stage {bold(meta.column_name)}
          </span>
        );
      case "COLUMN_DELETED":
        return (
          <span>
            {actorName} deleted stage {bold(meta.column_name)}
          </span>
        );
      case "PROJECT_CREATED":
        return (
          <span>
            {actorName} created project {bold(meta.project_name)}
          </span>
        );
      case "PROJECT_ARCHIVED":
        return (
          <span>
            {actorName} archived project {bold(meta.project_name)}
          </span>
        );
      case "PROJECT_RESTORED":
        return (
          <span>
            {actorName} restored project {bold(meta.project_name)}
          </span>
        );
      default:
        return (
          <span>
            {actorName} performed {activity.action}
          </span>
        );
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/25 backdrop-blur-xs z-40 transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 bottom-0 w-full sm:w-[420px] bg-card border-l border-border shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out translate-x-0 animate-slide-in select-none"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-bold text-foreground tracking-tight">
              Activity History
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label="Close activity history"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48 space-y-3">
              <Clock className="w-8 h-8 animate-spin text-primary/75" />
              <span className="text-sm font-medium text-muted-foreground">
                Loading history...
              </span>
            </div>
          ) : activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center px-4">
              <History className="w-8 h-8 text-muted-foreground/30 mb-2.5" />
              <span className="text-sm font-semibold text-foreground/80">
                No activity yet
              </span>
              <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">
                Create tasks, assign columns, or update priorities to populate this history.
              </p>
            </div>
          ) : (
            <div className="relative border-l border-border/60 pl-4 space-y-6 ml-3 py-2">
              {activities.map((activity) => {
                const actorName =
                  activity.actor?.full_name || activity.actor?.username || "Someone";
                const initials = getInitials(actorName);

                return (
                  <div key={activity.id} className="relative group select-none">
                    {/* Event Dot Indicator */}
                    <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-border group-hover:bg-primary transition-colors border-2 border-card z-10" />

                    <div className="flex items-start gap-3">
                      {/* Actor Avatar / Initials */}
                      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0 border border-border shadow-xs overflow-hidden">
                        {activity.actor?.avatar_url ? (
                          <img
                            src={activity.actor.avatar_url}
                            alt={actorName}
                            className="w-full h-full object-cover"
                          />
                        ) : initials ? (
                          initials
                        ) : (
                          <User className="w-3.5 h-3.5" />
                        )}
                      </div>

                      {/* Event details */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="text-xs text-muted-foreground leading-relaxed break-words">
                          {renderActivityText(activity)}
                        </div>
                        <div className="text-[10px] text-muted-foreground/60 font-mono font-medium">
                          {formatTimeAgo(activity.created_at)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
