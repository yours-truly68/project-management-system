"use client";

import * as React from "react";
import Link from "next/link";
import { useWorkspaces } from "@/features/workspaces/hooks/use-workspaces";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { useAuthStore } from "@/stores/auth.store";
import { useQueries } from "@tanstack/react-query";
import { boardService } from "@/features/boards/services/board.service";
import { taskService } from "@/features/tasks/services/task.service";
import { TaskDetailsDrawer } from "@/features/tasks/components/task-details-drawer";
import { useWorkspaceMembers } from "@/features/workspaces/hooks/use-workspace-members";
import { Task } from "@/features/tasks/types/task.types";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Clock,
  Coffee,
  FolderOpen,
  Sparkles,
} from "lucide-react";

import {
  PageContainer,
  PageHeader,
  Surface,
  EmptyState,
} from "@/components/ui/primitives";

export default function MyWorkPage() {
  const { activeWorkspace, isLoading: isWsLoading } = useWorkspaces();
  const { user } = useAuthStore();
  const { projects } = useProjects();
  const { members } = useWorkspaceMembers(activeWorkspace?.id || null);

  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);

  // Fetch all boards for projects
  const boardsQueries = useQueries({
    queries: (projects || []).map((p) => ({
      queryKey: ["boards", p.id],
      queryFn: () => boardService.listBoards(p.id),
      enabled: !!activeWorkspace && projects.length > 0,
    })),
  });

  const allBoards = React.useMemo(() => {
    return boardsQueries.flatMap((q) => q.data || []);
  }, [boardsQueries]);

  // Fetch tasks for all boards
  const tasksQueries = useQueries({
    queries: allBoards.map((b) => ({
      queryKey: ["tasks", b.id],
      queryFn: () => taskService.listTasks(b.id),
      enabled: allBoards.length > 0,
    })),
  });

  const allTasks = React.useMemo(() => {
    return tasksQueries.flatMap((q) => q.data || []);
  }, [tasksQueries]);

  // Filter tasks assigned to user
  const assignedTasks = React.useMemo(() => {
    return allTasks.filter((t) => t.assignee_id === user?.id);
  }, [allTasks, user]);

  if (isWsLoading) {
    return (
      <PageContainer className="animate-pulse">
        <div className="h-8 w-48 bg-accent/30 rounded-lg mb-6" />
        <div className="h-40 bg-accent/20 rounded-xl" />
      </PageContainer>
    );
  }

  if (!activeWorkspace) {
    return (
      <PageContainer className="flex items-center justify-center p-8">
        <EmptyState
          title="No Active Workspace"
          description="Select or create a workspace from the sidebar to see your assigned work."
          icon={FolderOpen}
        />
      </PageContainer>
    );
  }

  const completedCount = assignedTasks.filter((t) => t.priority === "LOW").length;
  const inProgressCount = assignedTasks.length - completedCount;

  return (
    <PageContainer className="animate-fade-in select-none">
      <PageHeader
        title="My Work"
        description={`Tasks assigned to you across all projects in ${activeWorkspace.name}.`}
      />

      <div className="flex-1 min-h-0 overflow-auto pt-6">
        {assignedTasks.length === 0 ? (
          <EmptyState
            title="You're all caught up!"
            description="No tasks are currently assigned to you. When team members assign you tasks, they'll appear here organized by priority."
            icon={Coffee}
            primaryAction={
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-all duration-200 cursor-pointer shadow-sm btn-interactive"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Browse Projects
              </Link>
            }
          />
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 max-w-sm shrink-0">
              <Surface className="flex items-center gap-3 p-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <div>
                  <span className="block text-lg font-bold text-foreground">{completedCount}</span>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">Completed</span>
                </div>
              </Surface>
              <Surface className="flex items-center gap-3 p-3">
                <Clock className="w-5 h-5 text-amber-500" />
                <div>
                  <span className="block text-lg font-bold text-foreground">{inProgressCount}</span>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">In Progress</span>
                </div>
              </Surface>
            </div>

            <Surface className="max-w-3xl">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 pb-2 border-b border-border/20">
                Assigned Tasks
              </h4>
              <div className="space-y-2.5">
                {assignedTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className="p-3 bg-secondary/30 hover:bg-secondary/70 border border-border/20 hover:border-border/60 rounded-xl transition-all duration-150 cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold tracking-wider">
                        Task #{task.position + 1}
                      </span>
                      <h4 className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                        {task.title}
                      </h4>
                    </div>
                    <span className={cn(
                      "text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider shrink-0",
                      task.priority === "HIGH" ? "bg-red-500/10 text-red-500 border border-red-500/20" :
                      task.priority === "MEDIUM" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                      "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                    )}>
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            </Surface>
          </div>
        )}
      </div>

      {selectedTask && (
        <TaskDetailsDrawer
          task={selectedTask}
          boardId={selectedTask.board_id}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          members={members}
        />
      )}
    </PageContainer>
  );
}
