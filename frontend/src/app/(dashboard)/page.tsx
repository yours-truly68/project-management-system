"use client";

import * as React from "react";
import { Plus, MoreHorizontal, Calendar, GripVertical } from "lucide-react";

interface Assignee {
  name: string;
  initials: string;
  color: string;
}

interface Task {
  id: string;
  code: string;
  title: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  dueDate: string;
  assignee: Assignee;
  labels?: string[];
}

interface Column {
  id: string;
  name: string;
  dotColor: string;
  tasks: Task[];
}

function PriorityIcon({ priority }: { priority: string }) {
  switch (priority) {
    case "CRITICAL":
      return (
        <span className="flex items-center gap-0.5 shrink-0" title="Critical Priority">
          <span className="w-1 h-3 bg-rose-500 rounded-sm inline-block" />
          <span className="w-1 h-3 bg-rose-500 rounded-sm inline-block" />
          <span className="w-1 h-3 bg-rose-500 rounded-sm inline-block" />
        </span>
      );
    case "HIGH":
      return (
        <span className="flex items-center gap-0.5 shrink-0" title="High Priority">
          <span className="w-1 h-3 bg-amber-500 rounded-sm inline-block" />
          <span className="w-1 h-3 bg-amber-500 rounded-sm inline-block" />
          <span className="w-1 h-1.5 bg-muted-foreground/30 rounded-sm inline-block" />
        </span>
      );
    case "MEDIUM":
      return (
        <span className="flex items-center gap-0.5 shrink-0" title="Medium Priority">
          <span className="w-1 h-3 bg-blue-500 rounded-sm inline-block" />
          <span className="w-1 h-1.5 bg-muted-foreground/30 rounded-sm inline-block" />
          <span className="w-1 h-1.5 bg-muted-foreground/30 rounded-sm inline-block" />
        </span>
      );
    case "LOW":
    default:
      return (
        <span className="flex items-center gap-0.5 shrink-0" title="Low Priority">
          <span className="w-1 h-1.5 bg-muted-foreground/40 rounded-sm inline-block" />
          <span className="w-1 h-1.5 bg-muted-foreground/20 rounded-sm inline-block" />
          <span className="w-1 h-1.5 bg-muted-foreground/20 rounded-sm inline-block" />
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
          code: "PMS-12",
          title: "Implement Auth Flow",
          priority: "HIGH",
          dueDate: "Jun 12",
          assignee: { name: "Sarah Connor", initials: "SC", color: "bg-purple-600 text-white" },
          labels: ["Auth", "Security"]
        },
        {
          id: "task-2",
          code: "PMS-14",
          title: "Design System Architecture & Multi-Tenant Partitioning Scheme",
          priority: "MEDIUM",
          dueDate: "Jun 15",
          assignee: { name: "John Doe", initials: "JD", color: "bg-blue-600 text-white" },
          labels: ["Design"]
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
          code: "PMS-11",
          title: "API Interceptor Mapping & Token Propagation",
          priority: "CRITICAL",
          dueDate: "Jun 10",
          assignee: { name: "Marcus Wright", initials: "MW", color: "bg-emerald-600 text-white" },
          labels: ["API", "Backend"]
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
          code: "PMS-1",
          title: "Next.js Template Bootstrap with Tailwind 4",
          priority: "LOW",
          dueDate: "May 28",
          assignee: { name: "Kyle Reese", initials: "KR", color: "bg-indigo-600 text-white" },
          labels: ["Setup"]
        },
      ],
    },
  ];

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Board Header Toolbar */}
      <div className="flex items-center justify-between border-b border-border pb-2">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground/90">Sprint 1 Board</h1>
          <p className="text-[11px] text-muted-foreground leading-none mt-0.5">Main delivery board for foundation items</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-1.5 px-2.5 py-1 bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-semibold rounded shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
            aria-label="Create new task"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Board Grid Area */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3 overflow-x-auto min-h-0">
        {mockColumns.map((column) => (
          <div key={column.id} className="flex flex-col bg-secondary/40 rounded border border-border p-2 space-y-2.5 min-w-[250px] h-full overflow-hidden">
            {/* Column Header */}
            <div className="flex items-center justify-between pb-0.5 select-none">
              <div className="flex items-center gap-1.5 min-w-0">
                <GripVertical className="w-3.5 h-3.5 text-muted-foreground/30 cursor-grab shrink-0 hover:text-muted-foreground/60 transition-colors" />
                <span className={`w-1.5 h-1.5 rounded-full ${column.dotColor} shrink-0`} />
                <h3 className="text-xs font-semibold text-foreground/80 truncate">
                  {column.name}
                </h3>
                <span className="text-[10px] bg-secondary/80 border border-border px-1 py-0.2 rounded font-medium text-muted-foreground/80">
                  {column.tasks.length}
                </span>
              </div>
              <div className="flex items-center gap-0.5">
                <button
                  className="text-muted-foreground/60 hover:text-foreground hover:bg-secondary/80 p-0.5 rounded transition-colors focus-visible:outline-none focus-visible:ring-1 cursor-pointer"
                  aria-label={`Add task to ${column.name}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button
                  className="text-muted-foreground/60 hover:text-foreground hover:bg-secondary/80 p-0.5 rounded transition-colors focus-visible:outline-none focus-visible:ring-1 cursor-pointer"
                  aria-label={`Column actions for ${column.name}`}
                >
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Column Tasks List */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5">
              {column.tasks.map((task) => (
                <div
                  key={task.id}
                  className="w-full text-left bg-card border border-border/80 hover:border-muted-foreground/20 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_2px_8px_rgba(0,0,0,0.2)] p-2.5 rounded shadow-sm cursor-grab active:cursor-grabbing transition-all space-y-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring block relative group"
                >
                  {/* Card Header: Code + Priority */}
                  <div className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground font-mono font-medium">{task.code}</span>
                      <PriorityIcon priority={task.priority} />
                    </div>
                    <button
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground/60 hover:text-foreground p-0.5 rounded hover:bg-secondary transition-opacity focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
                      aria-label="Task options"
                    >
                      <MoreHorizontal className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Card Body: Title */}
                  <h4 className="text-xs font-semibold leading-normal text-foreground/90 tracking-tight">
                    {task.title}
                  </h4>

                  {/* Card Labels / Badges */}
                  {task.labels && task.labels.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {task.labels.map((label) => (
                        <span
                          key={label}
                          className="px-1.5 py-0.5 rounded bg-secondary/80 text-muted-foreground text-[9px] font-bold tracking-wide border border-border/40"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Card Footer: Due Date + Assignee */}
                  <div className="flex items-center justify-between pt-1 border-t border-border/40">
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-secondary/40 px-1.5 py-0.5 rounded border border-border/20">
                      <Calendar className="w-3 h-3 text-muted-foreground/60 shrink-0" />
                      <span>{task.dueDate}</span>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full ${task.assignee.color} flex items-center justify-center text-[9px] font-bold shrink-0 shadow-sm border border-background`}
                      title={`Assigned to ${task.assignee.name}`}
                    >
                      {task.assignee.initials}
                    </div>
                  </div>
                </div>
              ))}

              {column.tasks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-border/70 rounded bg-secondary/10 select-none">
                  <div className="w-6 h-6 rounded bg-secondary flex items-center justify-center mb-1.5">
                    <Plus className="w-3.5 h-3.5 text-muted-foreground/60" />
                  </div>
                  <span className="text-[11px] font-semibold text-foreground/50">No tasks in column</span>
                  <span className="text-[9px] text-muted-foreground/60 mt-0.5 max-w-[150px]">
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
