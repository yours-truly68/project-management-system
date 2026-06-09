"use client";

import * as React from "react";
import { Plus, MoreHorizontal, Calendar, GripVertical, MessageSquare, Paperclip } from "lucide-react";

interface Assignee {
  name: string;
  initials: string;
  color: string;
}

interface Task {
  id: string;
  code: string;
  title: string;
  description: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  dueDate: string;
  assignee: Assignee;
  labels?: string[];
  commentsCount?: number;
  attachmentsCount?: number;
}

interface Column {
  id: string;
  name: string;
  dotColor: string;
  tasks: Task[];
}

function PriorityBadge({ priority }: { priority: string }) {
  switch (priority) {
    case "CRITICAL":
      return (
        <span className="px-2.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-bold tracking-wide select-none">
          Critical
        </span>
      );
    case "HIGH":
      return (
        <span className="px-2.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/25 text-rose-400 text-[10px] font-bold tracking-wide select-none">
          High
        </span>
      );
    case "MEDIUM":
      return (
        <span className="px-2.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold tracking-wide select-none">
          Medium
        </span>
      );
    case "LOW":
    default:
      return (
        <span className="px-2.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold tracking-wide select-none">
          Low
        </span>
      );
  }
}

export default function Page() {
  const mockColumns: Column[] = [
    {
      id: "todo",
      name: "To Do",
      dotColor: "bg-blue-500",
      tasks: [
        {
          id: "task-1",
          code: "KDO-12",
          title: "Implement Auth Flow",
          description: "Develop secure JWT-based backend endpoints and frontend AuthProviders to silently restore user sessions.",
          priority: "HIGH",
          dueDate: "Jun 12",
          assignee: { name: "Sarah Connor", initials: "SC", color: "bg-purple-600 text-white" },
          labels: ["Auth", "Security"],
          commentsCount: 45,
          attachmentsCount: 2
        },
        {
          id: "task-2",
          code: "KDO-14",
          title: "Design System Architecture & Multi-Tenant Partitioning Scheme",
          description: "Establish database partition boundaries and design robust tenant routing isolation guidelines.",
          priority: "MEDIUM",
          dueDate: "Jun 15",
          assignee: { name: "John Doe", initials: "JD", color: "bg-blue-600 text-white" },
          labels: ["Design"],
          commentsCount: 12,
          attachmentsCount: 14
        },
      ],
    },
    {
      id: "in-progress",
      name: "In Progress",
      dotColor: "bg-amber-500",
      tasks: [
        {
          id: "task-3",
          code: "KDO-11",
          title: "API Interceptor Mapping & Token Propagation",
          description: "Map global Axios interceptors to inject headers and handle silent token refresh cycles concurrently.",
          priority: "CRITICAL",
          dueDate: "Jun 10",
          assignee: { name: "Marcus Wright", initials: "MW", color: "bg-emerald-600 text-white" },
          labels: ["API", "Backend"],
          commentsCount: 45,
          attachmentsCount: 2
        },
      ],
    },
    {
      id: "review",
      name: "Review",
      dotColor: "bg-purple-500",
      tasks: [],
    },
    {
      id: "done",
      name: "Done",
      dotColor: "bg-emerald-500",
      tasks: [
        {
          id: "task-4",
          code: "KDO-1",
          title: "Next.js Template Bootstrap with Tailwind 4",
          description: "Scaffold next.js workspace, add TailwindCSS v4 configurations, and test core production build logic.",
          priority: "LOW",
          dueDate: "May 28",
          assignee: { name: "Kyle Reese", initials: "KR", color: "bg-indigo-600 text-white" },
          labels: ["Setup"],
          commentsCount: 5,
          attachmentsCount: 3
        },
      ],
    },
  ];

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Board Header Toolbar */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground/90">Sprint 1 Board</h1>
          <p className="text-sm text-muted-foreground leading-none mt-1.5">Main delivery board for foundation items</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/95 text-sm font-semibold rounded-md shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer animate-fade-in"
            aria-label="Create new task"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Board Column Flex Area */}
      <div className="flex-1 flex gap-4 overflow-x-auto min-h-0 pb-4">
        {mockColumns.map((column) => (
          <div
            key={column.id}
            className="flex flex-col bg-secondary/40 rounded-xl border border-border p-4.5 space-y-4 min-w-[350px] flex-1 h-full overflow-hidden"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-0.5 select-none">
              <div className="flex items-center gap-2 min-w-0">
                <GripVertical className="w-4 h-4 text-muted-foreground/30 cursor-grab shrink-0 hover:text-muted-foreground/60 transition-colors" />
                <span className={`w-2 h-2 rounded-full ${column.dotColor} shrink-0`} />
                <h3 className="text-lg font-bold text-foreground/90 truncate">
                  {column.name}
                </h3>
                <span className="text-sm bg-secondary/80 border border-border px-2.5 py-1 rounded-lg font-semibold text-muted-foreground/85">
                  {column.tasks.length}
                </span>
              </div>
              <div className="flex items-center gap-0.5">
                <button
                  className="text-muted-foreground/60 hover:text-foreground hover:bg-secondary/80 p-0.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-1 cursor-pointer"
                  aria-label={`Add task to ${column.name}`}
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  className="text-muted-foreground/60 hover:text-foreground hover:bg-secondary/80 p-0.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-1 cursor-pointer"
                  aria-label={`Column actions for ${column.name}`}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Add Task Button Block (Reference matching) */}
            <button
              className="w-full flex items-center justify-center py-2.5 rounded-lg border border-dashed border-border/60 hover:border-border hover:bg-secondary/25 transition-all text-muted-foreground/65 hover:text-foreground cursor-pointer text-xs"
              aria-label={`Quick add task to ${column.name}`}
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* Column Tasks List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-0.5">
              {column.tasks.map((task) => (
                <div
                  key={task.id}
                  className="w-full text-left bg-card border border-border/80 hover:border-muted-foreground/20 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)] p-5.5 rounded-xl shadow-sm cursor-grab active:cursor-grabbing transition-all space-y-4.5 block relative group min-h-[170px]"
                >
                  {/* Card Header: Priority Pill + Actions Menu */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <PriorityBadge priority={task.priority} />
                      <span className="text-muted-foreground/60 font-mono font-semibold text-[10px] tracking-wide">
                        {task.code}
                      </span>
                    </div>
                    <button
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground/60 hover:text-foreground p-0.5 rounded hover:bg-secondary transition-opacity focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
                      aria-label="Task options"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Card Body: Title & Description */}
                  <div className="space-y-2">
                    <h4 className="text-[15px] font-bold leading-snug text-foreground/90 tracking-tight">
                      {task.title}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {task.description}
                    </p>
                  </div>

                  {/* Card Labels / Badges */}
                  {task.labels && task.labels.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {task.labels.map((label) => (
                        <span
                          key={label}
                          className="px-2 py-0.5 rounded bg-secondary/50 border border-border/40 text-muted-foreground text-[10px] font-semibold tracking-wide"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Card Footer: Metadata (Due Date + Comments/Attachments counts) + Assignee */}
                  <div className="flex items-center justify-between pt-3 border-t border-border/40">
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                      <div className="flex items-center gap-1.5 bg-secondary/40 px-2 py-0.5 rounded border border-border/20">
                        <Calendar className="w-3 h-3 text-muted-foreground/60 shrink-0" />
                        <span>{task.dueDate}</span>
                      </div>
                      {task.commentsCount !== undefined && task.commentsCount > 0 && (
                        <div className="flex items-center gap-1 text-muted-foreground/60" title="Comments count">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{task.commentsCount}</span>
                        </div>
                      )}
                      {task.attachmentsCount !== undefined && task.attachmentsCount > 0 && (
                        <div className="flex items-center gap-1 text-muted-foreground/60" title="Attachments count">
                          <Paperclip className="w-3.5 h-3.5" />
                          <span>{task.attachmentsCount}</span>
                        </div>
                      )}
                    </div>

                    <div
                      className={`w-6.5 h-6.5 rounded-full ${task.assignee.color} flex items-center justify-center text-[10px] font-bold shrink-0 shadow-sm border border-background`}
                      title={`Assigned to ${task.assignee.name}`}
                    >
                      {task.assignee.initials}
                    </div>
                  </div>
                </div>
              ))}

              {column.tasks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border/70 rounded-xl bg-secondary/10 select-none">
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center mb-2">
                    <Plus className="w-4 h-4 text-muted-foreground/60" />
                  </div>
                  <span className="text-xs font-semibold text-foreground/50">No tasks in column</span>
                  <span className="text-[10px] text-muted-foreground/60 mt-1 max-w-[180px]">
                    Create a task or drag files here to start.
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
