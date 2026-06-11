"use client";

import * as React from "react";
import Link from "next/link";
import { useWorkspaces } from "@/features/workspaces/hooks/use-workspaces";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { useBoards } from "@/features/boards/hooks/use-boards";
import { useColumns, useDeleteColumn } from "@/features/columns/hooks/use-columns";
import { useWorkspaceMembers } from "@/features/workspaces/hooks/use-workspace-members";
import { useAuthStore } from "@/stores/auth.store";
import { BoardEmptyState } from "@/features/boards/components/board-empty-state";
import { EditBoardModal } from "@/features/boards/components/edit-board-modal";
import { CreateColumnModal } from "@/features/columns/components/create-column-modal";
import { EditColumnModal } from "@/features/columns/components/edit-column-modal";
import { Column } from "@/features/columns/types/column.types";
import {
  Plus,
  Loader2,
  Edit3,
  Archive,
  Star,
  History,
} from "lucide-react";
import { useProjectStore } from "@/stores/project.store";
import { useUpdateProject } from "@/features/projects/hooks/use-projects";
import { useTasks } from "@/features/tasks/hooks/use-tasks";
import { CreateTaskModal } from "@/features/tasks/components/create-task-modal";
import { TaskDetailsDrawer } from "@/features/tasks/components/task-details-drawer";
import { Task } from "@/features/tasks/types/task.types";
import { cn } from "@/lib/utils";

import { ViewSwitcher } from "@/features/boards/components/view-switcher";
import { BoardView } from "@/features/boards/components/board-view";
import { ListView } from "@/features/boards/components/list-view";
import { useBoardPreference, useUpdateBoardPreference } from "@/features/boards/hooks/use-board-preferences";
import { useFavorites, useCreateFavorite, useDeleteFavorite } from "@/features/favorites/hooks/use-favorites";
import { ActivityFeedDrawer } from "@/features/activity/components/activity-feed-drawer";


export default function Page() {
  const { activeWorkspace, isLoading: isWorkspaceLoading } = useWorkspaces();
  const { activeProject, isLoading: isProjectLoading } = useProjects();
  const { activeBoard, isLoading: isBoardLoading } = useBoards();
  const { data: columns = [], isLoading: isColumnsLoading } = useColumns(
    activeBoard?.id || null
  );
  const { mutateAsync: deleteColumn } = useDeleteColumn(activeBoard?.id || null);

  // Fetch tasks for the active board
  const { data: tasks = [], isLoading: isTasksLoading } = useTasks(activeBoard?.id || null);

  const { user } = useAuthStore();
  const { members } = useWorkspaceMembers(activeWorkspace?.id || null);

  // Board view preference
  const { data: prefData } = useBoardPreference(activeBoard?.id || null);
  const { mutate: updatePreference } = useUpdateBoardPreference(activeBoard?.id || null);
  const viewMode = (prefData?.view_type || "board") as "board" | "list";

  // Favorites
  const { data: favorites = [] } = useFavorites();
  const { mutate: createFavorite } = useCreateFavorite();
  const { mutate: deleteFavorite } = useDeleteFavorite();

  const matchingFavorite = favorites.find(
    (fav) => fav.entity_type === "board" && fav.entity_id === activeBoard?.id
  );
  const isFavorited = !!matchingFavorite;

  const handleFavoriteToggle = () => {
    if (!activeBoard) return;
    if (isFavorited && matchingFavorite) {
      deleteFavorite(matchingFavorite.id);
    } else {
      createFavorite({ entity_type: "board", entity_id: activeBoard.id });
    }
  };

  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isColumnCreateOpen, setIsColumnCreateOpen] = React.useState(false);
  const [isActivityOpen, setIsActivityOpen] = React.useState(false);
  const [columnToEdit, setColumnToEdit] = React.useState<Column | null>(null);

  // Task quick-create and details drawer states
  const [taskToCreateColId, setTaskToCreateColId] = React.useState<string | null>(null);
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);

  const archivedEntity = useProjectStore((s) => s.archivedEntity);
  const setArchivedEntity = useProjectStore((s) => s.setArchivedEntity);

  const { mutateAsync: updateProject, isPending: isRestoring } = useUpdateProject(archivedEntity?.id || "");

  // Group tasks client-side by column_id and sort by position ascending
  const tasksByColumn = React.useMemo(() => {
    const groups: Record<string, Task[]> = {};
    columns.forEach((col) => {
      groups[col.id] = [];
    });
    tasks.forEach((task) => {
      if (groups[task.column_id]) {
        groups[task.column_id].push(task);
      }
    });
    Object.keys(groups).forEach((colId) => {
      groups[colId].sort((a, b) => a.position - b.position);
    });
    return groups;
  }, [columns, tasks]);

  const handleRestore = async () => {
    if (!archivedEntity) return;
    try {
      await updateProject({ is_archived: false });
      const { setActiveProjectId } = useProjectStore.getState();
      setActiveProjectId(archivedEntity.id);
      setArchivedEntity(null);
    } catch (err) {
      console.error("Failed to restore archived project:", err);
    }
  };

  // Permission checks
  const currentUserMember = members.find((m) => m.user_id === user?.id);
  const role = currentUserMember?.role || "MEMBER";
  const canManageBoard = role === "OWNER" || role === "ADMIN";

  if (isWorkspaceLoading || isProjectLoading || isBoardLoading || isColumnsLoading || isTasksLoading) {
    return (
      <div className="flex flex-col h-full space-y-4">
        {/* Board Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-column-surface rounded-lg animate-pulse" />
            <div className="h-4 w-96 bg-column-surface rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-2.5 h-10 w-48 bg-column-surface rounded-lg animate-pulse" />
        </div>

        {/* Columns & Cards Skeleton */}
        <div className="flex-1 flex gap-4 overflow-x-auto min-h-0 pb-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex flex-col bg-column-surface rounded-[18px] border border-border p-4 space-y-4 w-[360px] shrink-0 h-full overflow-hidden animate-pulse"
            >
              {/* Column Header Shimmer */}
              <div className="flex items-center justify-between pb-0.5">
                <div className="flex items-center gap-2.5 w-1/2">
                  <div className="w-2.5 h-2.5 rounded-full bg-accent shrink-0" />
                  <div className="h-5 bg-accent rounded w-28" />
                </div>
                <div className="w-6 h-6 bg-accent rounded" />
              </div>

              {/* Add Task CTA Shimmer */}
              <div className="w-full h-11 bg-accent rounded-xl" />

              {/* Tasks Shimmer list */}
              <div className="flex-1 space-y-3">
                {[1, 2].map((j) => (
                  <div
                    key={j}
                    className="p-4 border border-border bg-card rounded-2xl space-y-3 shadow-sm"
                  >
                    <div className="h-4 w-12 bg-accent rounded-full" />
                    <div className="space-y-2">
                      <div className="h-4 bg-accent rounded w-5/6" />
                      <div className="h-3.5 bg-accent rounded w-3/4" />
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div className="h-4 bg-accent rounded w-16" />
                      <div className="w-6 h-6 rounded-full bg-accent" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!activeWorkspace) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] p-8 text-center rounded-xl border border-dashed border-border bg-card/40 animate-fade-in select-none">
        <h3 className="text-base font-semibold text-foreground mb-1">No Active Workspace</h3>
        <p className="text-xs text-muted-foreground max-w-sm mt-1">
          Select or create a workspace from the sidebar switcher to start.
        </p>
      </div>
    );
  }

  if (archivedEntity) {
    const isProject = archivedEntity.type === "project";
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] p-8 text-center rounded-xl border border-dashed border-border bg-card/40 animate-fade-in select-none max-w-xl mx-auto my-12">
        <Archive className="w-10 h-10 text-amber-500 mb-4 shrink-0" />
        <h3 className="text-lg font-bold text-foreground mb-1">
          {isProject ? "Project" : "Board"} Archived
        </h3>
        <p className="text-xs text-muted-foreground max-w-sm mt-1.5 leading-relaxed">
          The {archivedEntity.type} <span className="font-semibold text-foreground">&quot;{archivedEntity.name}&quot;</span> has been archived. You cannot edit it or add columns/tasks while it remains archived.
        </p>
        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={handleRestore}
            disabled={isRestoring}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isRestoring && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Restore {isProject ? "Project" : "Board"}
          </button>
          <button
            onClick={() => setArchivedEntity(null)}
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-border text-foreground hover:bg-secondary transition-colors cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  if (!activeProject) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] p-8 text-center rounded-xl border border-dashed border-border bg-card/40 animate-fade-in select-none">
        <h3 className="text-base font-semibold text-foreground mb-1">No Active Project</h3>
        <p className="text-xs text-muted-foreground max-w-sm mt-1">
          Select or create a project from the sidebar to view its board.
        </p>
      </div>
    );
  }

  if (!activeBoard) {
    return <BoardEmptyState />;
  }

  const getColumnColor = (name: string, defaultColor: string | null) => {
    const norm = name.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (norm.includes("todo") || norm.includes("backlog")) return "#FF8A3D"; // Orange
    if (norm.includes("progress") || norm.includes("active")) return "#3B82F6"; // Blue
    if (norm.includes("review") || norm.includes("qa") || norm.includes("test")) return "#A855F7"; // Purple
    if (norm.includes("done") || norm.includes("complete") || norm.includes("finish")) return "#22C55E"; // Green
    return defaultColor || "#3B82F6";
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Board Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-border pb-5 pt-6 shrink-0">
        <div>
          <div className="flex flex-col gap-2.5">
            <Link
              href="/boards"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-all font-semibold bg-secondary/80 border border-border/40 px-2.5 py-1 rounded-lg w-fit select-none cursor-pointer"
            >
              ← Back to Boards
            </Link>
            <div className="flex items-center gap-2 mt-1">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground select-none animate-fade-in">
                {activeBoard.name}
              </h1>
            <button
              onClick={handleFavoriteToggle}
              className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-amber-500 transition-colors cursor-pointer shrink-0 mt-1"
              aria-label={isFavorited ? "Unfavorite board" : "Favorite board"}
            >
              <Star
                className={cn(
                  "w-5 h-5 transition-all duration-200",
                  isFavorited ? "text-amber-500 fill-amber-500" : "text-muted-foreground/35"
                )}
              />
            </button>
          </div>
          {activeBoard.description && (
            <p className="text-sm text-secondary-text mt-1.5 max-w-2xl truncate leading-relaxed">
              {activeBoard.description}
            </p>
          )}
          </div>
        </div>
        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0 pt-1 flex-wrap sm:flex-nowrap">
          <ViewSwitcher
            currentView={viewMode}
            onViewChange={(v) => updatePreference(v)}
          />
          <button
            onClick={() => setIsActivityOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-border text-foreground hover:bg-card-hover text-xs font-semibold transition-all cursor-pointer animate-fade-in"
            aria-label="View activity history"
          >
            <History className="w-3.5 h-3.5" />
            <span>History</span>
          </button>
          {canManageBoard && (
            <button
              onClick={() => setIsEditOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-border text-foreground hover:bg-card-hover text-xs font-semibold transition-all cursor-pointer animate-fade-in"
              aria-label="Edit board"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Board</span>
            </button>
          )}
          {canManageBoard && (
            <button
              onClick={() => setIsColumnCreateOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-colors cursor-pointer animate-fade-in"
              aria-label="Create new column"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Column</span>
            </button>
          )}
        </div>
      </div>

      {/* Board Column Flex Area or List View */}
      {viewMode === "list" ? (
        <ListView
          columns={columns}
          tasksByColumn={tasksByColumn}
          members={members}
          canManageBoard={canManageBoard}
          onAddTask={setTaskToCreateColId}
          onSelectTask={setSelectedTask}
          getColumnColor={getColumnColor}
        />
      ) : (
        <BoardView
          boardId={activeBoard.id}
          columns={columns}
          tasksByColumn={tasksByColumn}
          members={members}
          canManageBoard={canManageBoard}
          onEditColumn={setColumnToEdit}
          onDeleteColumn={deleteColumn}
          onAddTask={setTaskToCreateColId}
          onSelectTask={setSelectedTask}
          getColumnColor={getColumnColor}
        />
      )}

      {/* Dialogs & Modals */}
      {isEditOpen && activeBoard && (
        <EditBoardModal
          board={activeBoard}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
        />
      )}

      {isColumnCreateOpen && activeBoard && (
        <CreateColumnModal
          boardId={activeBoard.id}
          isOpen={isColumnCreateOpen}
          onClose={() => setIsColumnCreateOpen(false)}
          nextPosition={columns.length}
        />
      )}

      {columnToEdit && activeBoard && (
        <EditColumnModal
          column={columnToEdit}
          boardId={activeBoard.id}
          isOpen={!!columnToEdit}
          onClose={() => setColumnToEdit(null)}
        />
      )}

      {taskToCreateColId && activeBoard && (
        <CreateTaskModal
          boardId={activeBoard.id}
          columnId={taskToCreateColId}
          isOpen={!!taskToCreateColId}
          onClose={() => setTaskToCreateColId(null)}
          nextPosition={tasksByColumn[taskToCreateColId]?.length || 0}
          members={members}
        />
      )}

      {selectedTask && activeBoard && (
        <TaskDetailsDrawer
          task={selectedTask}
          boardId={activeBoard.id}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          members={members}
        />
      )}

      {activeWorkspace && (
        <ActivityFeedDrawer
          workspaceId={activeWorkspace.id}
          projectId={activeProject?.id}
          boardId={activeBoard?.id}
          isOpen={isActivityOpen}
          onClose={() => setIsActivityOpen(false)}
        />
      )}
    </div>
  );
}
