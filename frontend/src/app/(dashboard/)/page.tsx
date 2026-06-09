import * as React from "react";
import { Plus, MoreHorizontal } from "lucide-react";

export default function Page() {
  const mockColumns = [
    {
      id: "todo",
      name: "To Do",
      color: "bg-blue-500",
      tasks: [
        { id: "task-1", title: "Implement Auth Flow", priority: "HIGH", code: "PMS-12" },
        { id: "task-2", title: "Design System Architecture", priority: "MEDIUM", code: "PMS-14" },
      ],
    },
    {
      id: "in-progress",
      name: "In Progress",
      color: "bg-amber-500",
      tasks: [
        { id: "task-3", title: "API Interceptor Mapping", priority: "CRITICAL", code: "PMS-11" },
      ],
    },
    {
      id: "review",
      name: "Review",
      color: "bg-purple-500",
      tasks: [],
    },
    {
      id: "done",
      name: "Done",
      color: "bg-emerald-500",
      tasks: [
        { id: "task-4", title: "Next.js Template Bootstrap", priority: "LOW", code: "PMS-1" },
      ],
    },
  ];

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Board Header Toolbar */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Sprint 1 Board</h1>
          <p className="text-xs text-muted-foreground">Main delivery board for foundation items</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-semibold rounded-md shadow-sm transition-colors">
            <Plus className="w-3.5 h-3.5" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Board Grid Area */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 overflow-x-auto min-h-0">
        {mockColumns.map((column) => (
          <div key={column.id} className="flex flex-col bg-card/40 rounded-lg border border-border p-3 space-y-3 min-w-[250px]">
            {/* Column Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${column.color}`} />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {column.name}
                </h3>
                <span className="text-[10px] bg-accent px-1.5 py-0.5 rounded font-medium text-muted-foreground">
                  {column.tasks.length}
                </span>
              </div>
              <button className="text-muted-foreground/60 hover:text-foreground p-0.5 rounded hover:bg-accent transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Column Tasks List */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {column.tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-card hover:bg-accent/40 border border-border hover:border-accent p-3 rounded-md shadow-sm cursor-grab active:cursor-grabbing transition-all space-y-2"
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground font-mono">{task.code}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded font-semibold tracking-wide ${
                        task.priority === "CRITICAL"
                          ? "bg-destructive/10 text-destructive"
                          : task.priority === "HIGH"
                          ? "bg-amber-500/10 text-amber-500"
                          : task.priority === "MEDIUM"
                          ? "bg-blue-500/10 text-blue-500"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                  <h4 className="text-xs font-medium leading-snug">{task.title}</h4>
                </div>
              ))}

              {column.tasks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-[11px] text-muted-foreground/40 border border-dashed border-border rounded-md">
                  No tasks in column
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
