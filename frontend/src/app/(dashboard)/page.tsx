"use client";

import * as React from "react";
import Link from "next/link";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useWorkspaces } from "@/features/workspaces/hooks/use-workspaces";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { useBoards } from "@/features/boards/hooks/use-boards";
import { useColumns, useDeleteColumn } from "@/features/columns/hooks/use-columns";
import { useWorkspaceMembers } from "@/features/workspaces/hooks/use-workspace-members";
import { useAuthStore } from "@/stores/auth.store";
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
  Layers,
  FolderPlus,
  Sparkles,
  Calendar,
  Clock,
  CheckCircle2,
  LayoutGrid,
  Folder,
  ArrowRight,
  TrendingUp,
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
import { ColumnNavigator } from "@/features/boards/components/column-navigator";
import { useBoardPreference, useUpdateBoardPreference } from "@/features/boards/hooks/use-board-preferences";
import { useFavorites, useCreateFavorite, useDeleteFavorite } from "@/features/favorites/hooks/use-favorites";
import { ActivityFeedDrawer } from "@/features/activity/components/activity-feed-drawer";
import { CreateWorkspaceModal } from "@/features/workspaces/components/create-workspace-modal";
import { CreateProjectModal } from "@/features/projects/components/create-project-modal";
import { CreateBoardModal } from "@/features/boards/components/create-board-modal";

import { boardService } from "@/features/boards/services/board.service";
import { taskService } from "@/features/tasks/services/task.service";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { useBoardStore } from "@/stores/board.store";
import { useActivities } from "@/features/activity/hooks/use-activities";

import {
  PageContainer,
  PageHeader,
  ActionToolbar,
  SplitLayout,
  ContentGrid,
  PageSidebar,
  Surface,
  StatCard,
  EntityCard,
  EmptyState,
  CommandButton,
  SearchInput,
  AvatarGroup,
  ActivityItem,
  Timeline,
  PropertyRow,
  ProgressIndicator,
} from "@/components/ui/primitives";

/* ─── Hero Empty State Onboarding Components ─── */

function NoWorkspaceHero() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  return (
    <div className="flex-1 flex items-center justify-center p-8 select-none animate-fade-in relative overflow-hidden">
      <div className="absolute inset-0 dots-pattern opacity-60" />
      <EmptyState
        title="Welcome to KANDo"
        description="Create your first workspace to start organizing projects, boards, and tasks with your team."
        icon={Layers}
        primaryAction={
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all duration-200 cursor-pointer shadow-sm btn-interactive"
          >
            <Plus className="w-4 h-4" />
            Create Workspace
          </button>
        }
      />
      {isModalOpen && (
        <CreateWorkspaceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}

function NoProjectHero() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  return (
    <div className="flex-1 flex items-center justify-center p-8 select-none animate-fade-in relative overflow-hidden">
      <div className="absolute inset-0 dots-pattern opacity-60" />
      <EmptyState
        title="Create Your First Project"
        description="Projects organize your work into boards and tasks. Start by creating a project to get things moving."
        icon={FolderPlus}
        primaryAction={
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all duration-200 cursor-pointer shadow-sm btn-interactive"
          >
            <Plus className="w-4 h-4" />
            Create Project
          </button>
        }
      />
      {isModalOpen && (
        <CreateProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}

export default function Page() {
  const { activeWorkspace, isLoading: isWorkspaceLoading } = useWorkspaces();
  const { activeWorkspaceId } = useWorkspaceStore();
  const { projects, isLoading: isProjectsLoading } = useProjects();
  const { activeProject } = useProjects();
  const { activeBoard, isLoading: isBoardLoading } = useBoards();
  const { activeBoardId, setActiveBoardId } = useBoardStore();
  const { activeProjectId, setActiveProjectId } = useProjectStore();

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

  // Modals state
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isColumnCreateOpen, setIsColumnCreateOpen] = React.useState(false);
  const [isActivityOpen, setIsActivityOpen] = React.useState(false);
  const [columnToEdit, setColumnToEdit] = React.useState<Column | null>(null);

  // Task quick-create and details drawer states
  const [taskToCreateColId, setTaskToCreateColId] = React.useState<string | null>(null);
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);

  const columnRefs = React.useRef<Record<string, HTMLDivElement | null>>({});

  const archivedEntity = useProjectStore((s) => s.archivedEntity);
  const setArchivedEntity = useProjectStore((s) => s.setArchivedEntity);
  const { mutateAsync: updateProject, isPending: isRestoring } = useUpdateProject(archivedEntity?.id || "");

  // Modal actions triggered from Dashboard widgets
  const [isCreateProjOpen, setIsCreateProjOpen] = React.useState(false);
  const [isCreateBoardOpen, setIsCreateBoardOpen] = React.useState(false);

  // --- Workspace-wide Data Aggregation for productivity Hub ---
  // Fetch boards for all projects
  const boardsQueries = useQueries({
    queries: (projects || []).map((p) => ({
      queryKey: ["boards", p.id],
      queryFn: () => boardService.listBoards(p.id),
      enabled: !activeBoardId && projects.length > 0,
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
      enabled: !activeBoardId && allBoards.length > 0,
    })),
  });

  const allTasks = React.useMemo(() => {
    return tasksQueries.flatMap((q) => q.data || []);
  }, [tasksQueries]);

  // Filter tasks assigned to user
  const assignedTasks = React.useMemo(() => {
    return allTasks.filter((t) => t.assignee_id === user?.id);
  }, [allTasks, user]);

  const dueSoonTasks = React.useMemo(() => {
    return assignedTasks
      .filter((t) => t.due_date)
      .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
      .slice(0, 5);
  }, [assignedTasks]);

  const workspaceActivities = useActivities(activeWorkspace?.id || null);

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

  // Group tasks client-side for active board view
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

  // Permission checks
  const currentUserMember = members.find((m) => m.user_id === user?.id);
  const role = currentUserMember?.role || "MEMBER";
  const canManageBoard = role === "OWNER" || role === "ADMIN";

  if (isWorkspaceLoading || isProjectsLoading || isBoardLoading || isColumnsLoading || isTasksLoading) {
    return (
      <PageContainer className="animate-pulse">
        <div className="h-8 w-48 bg-accent/30 rounded-lg mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <div className="h-40 bg-accent/20 rounded-xl" />
            <div className="h-60 bg-accent/20 rounded-xl" />
          </div>
          <div className="lg:col-span-1 h-80 bg-accent/20 rounded-xl" />
        </div>
      </PageContainer>
    );
  }

  if (!activeWorkspace) {
    return <NoWorkspaceHero />;
  }

  // Display archived block if active entity is archived
  if (archivedEntity) {
    const isProject = archivedEntity.type === "project";
    return (
      <div className="flex-1 flex items-center justify-center p-8 select-none animate-fade-in relative overflow-hidden">
        <div className="absolute inset-0 dots-pattern opacity-40" />
        <Surface className="max-w-md w-full text-center p-6 space-y-4">
          <Archive className="w-10 h-10 text-amber-500 mx-auto shrink-0" />
          <h3 className="text-lg font-bold text-foreground">
            {isProject ? "Project" : "Board"} Archived
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The {archivedEntity.type} &ldquo;{archivedEntity.name}&rdquo; has been archived. You cannot edit it or add columns/tasks while it remains archived.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleRestore}
              disabled={isRestoring}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-amber-500 text-white hover:bg-amber-400 transition-all cursor-pointer disabled:opacity-50"
            >
              {isRestoring && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Restore {isProject ? "Project" : "Board"}
            </button>
            <button
              onClick={() => setArchivedEntity(null)}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-border text-foreground hover:bg-accent/40 transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </Surface>
      </div>
    );
  }

  if (projects.length === 0) {
    return <NoProjectHero />;
  }

  // RENDER DAFBOARD PRODUCTIVITY HUB (if no board is active)
  if (!activeBoardId) {
    const hours = new Date().getHours();
    const greeting = hours < 12 ? "Good Morning" : hours < 18 ? "Good Afternoon" : "Good Evening";
    const displayName = user?.full_name?.split(" ")[0] || "there";

    // Filter projects & boards that are favorited
    const favProjects = favorites.filter((f) => f.entity_type === "project");
    const favBoards = favorites.filter((f) => f.entity_type === "board");

    return (
      <PageContainer className="animate-fade-in select-none">
        <PageHeader
          title={`${greeting}, ${displayName}`}
          description={`Welcome to your command center for ${activeWorkspace.name}. Here is what needs your attention today.`}
          actions={
            <AvatarGroup
              members={members.map((m) => ({ name: m.full_name, avatarUrl: m.avatar_url }))}
            />
          }
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 shrink-0">
          <StatCard label="Total Projects" value={projects.length} icon={Folder} />
          <StatCard label="Active Boards" value={allBoards.length} icon={LayoutGrid} />
          <StatCard label="Assigned Tasks" value={assignedTasks.length} icon={Clock} />
          <StatCard label="Workspace Members" value={members.length} icon={Sparkles} />
        </div>

        <SplitLayout
          sidebar={
            <PageSidebar>
              {/* Quick Create Widget */}
              <div>
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                  Quick Create
                </h4>
                <div className="space-y-2">
                  <button
                    onClick={() => setIsCreateProjOpen(true)}
                    className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-semibold rounded-lg bg-secondary/80 border border-border hover:bg-secondary transition-all text-left cursor-pointer btn-interactive"
                  >
                    <span>New Project</span>
                    <Plus className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => setIsCreateBoardOpen(true)}
                    className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-semibold rounded-lg bg-secondary/80 border border-border hover:bg-secondary transition-all text-left cursor-pointer btn-interactive"
                  >
                    <span>New Board</span>
                    <Plus className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </div>
              </div>

              {/* Favorites Widget */}
              {favorites.length > 0 && (
                <div className="border-t border-border/20 pt-4">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                    Favorites
                  </h4>
                  <div className="space-y-2">
                    {favProjects.map((fav) => {
                      const proj = projects.find((p) => p.id === fav.entity_id);
                      if (!proj) return null;
                      return (
                        <button
                          key={fav.id}
                          onClick={() => {
                            setActiveProjectId(proj.id);
                            setActiveBoardId(null);
                            router.push("/boards");
                          }}
                          className="w-full flex items-center gap-2 px-2 py-1 rounded-md text-xs text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-secondary/40 text-left transition-all"
                        >
                          <Folder className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                          <span className="truncate flex-1 font-semibold">{proj.name}</span>
                        </button>
                      );
                    })}
                    {favBoards.map((fav) => {
                      const brd = allBoards.find((b) => b.id === fav.entity_id);
                      if (!brd) return null;
                      return (
                        <button
                          key={fav.id}
                          onClick={() => {
                            setActiveProjectId(brd.project_id);
                            setActiveBoardId(brd.id);
                            router.push("/");
                          }}
                          className="w-full flex items-center gap-2 px-2 py-1 rounded-md text-xs text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-secondary/40 text-left transition-all"
                        >
                          <LayoutGrid className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                          <span className="truncate flex-1 font-semibold">{brd.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </PageSidebar>
          }
        >
          <div className="space-y-6">
            {/* Continue Working / Recent Projects Grid */}
            <div>
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                Continue Working
              </h3>
              <ContentGrid>
                {projects.slice(0, 3).map((proj) => {
                  const projBoards = allBoards.filter((b) => b.project_id === proj.id);
                  return (
                    <EntityCard
                      key={proj.id}
                      title={proj.name}
                      description={proj.description || "No description provided."}
                      icon={<Folder className="w-4 h-4 text-primary shrink-0" />}
                      onClick={() => {
                        setActiveProjectId(proj.id);
                        setActiveBoardId(null);
                        router.push("/boards");
                      }}
                      metadata={
                        <div className="flex items-center justify-between w-full">
                          <span>{projBoards.length} boards</span>
                          <span>Updated {new Date(proj.updated_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                        </div>
                      }
                    />
                  );
                })}
              </ContentGrid>
            </div>

            {/* Assigned to Me / Due Soon Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Assigned to Me */}
              <Surface className="flex flex-col min-h-[300px]">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 pb-2 border-b border-border/20">
                  Assigned to Me ({assignedTasks.length})
                </h4>
                <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[320px] pr-1">
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

                  {assignedTasks.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full py-16 text-center text-muted-foreground/50">
                      <CheckCircle2 className="w-7 h-7 mb-2 text-muted-foreground/30" />
                      <span className="text-xs font-medium">You&apos;re all caught up!</span>
                    </div>
                  )}
                </div>
              </Surface>

              {/* Due Soon / Needs Attention */}
              <Surface className="flex flex-col min-h-[300px]">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 pb-2 border-b border-border/20">
                  Due Soon
                </h4>
                <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[320px] pr-1">
                  {dueSoonTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className="p-3 bg-secondary/30 hover:bg-secondary/70 border border-border/20 hover:border-border/60 rounded-xl transition-all duration-150 cursor-pointer flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-foreground truncate">
                          {task.title}
                        </h4>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1 shrink-0">
                        <Calendar className="w-3 h-3" />
                        {new Date(task.due_date!).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  ))}

                  {dueSoonTasks.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full py-16 text-center text-muted-foreground/50">
                      <Calendar className="w-7 h-7 mb-2 text-muted-foreground/30" />
                      <span className="text-xs font-medium">No upcoming due dates.</span>
                    </div>
                  )}
                </div>
              </Surface>
            </div>

            {/* Workspace Recent Activity */}
            <Surface>
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 pb-2 border-b border-border/20 flex items-center justify-between">
                <span>Recent Workspace Activity</span>
                <History className="w-3.5 h-3.5" />
              </h3>
              <Timeline>
                {workspaceActivities.data?.slice(0, 4).map((activity) => (
                  <ActivityItem
                    key={activity.id}
                    actor={activity.actor?.full_name || "Workspace member"}
                    action={activity.action.toLowerCase().replace(/_/g, " ")}
                    timestamp={new Date(activity.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    details={activity.metadata?.task_title || activity.metadata?.project_name || undefined}
                  />
                ))}
                {(!workspaceActivities.data || workspaceActivities.data.length === 0) && (
                  <span className="text-xs text-muted-foreground/50 block py-6 text-center">
                    No recent activity logs.
                  </span>
                )}
              </Timeline>
            </Surface>
          </div>
        </SplitLayout>

        {/* Quick Modals */}
        {isCreateProjOpen && (
          <CreateProjectModal isOpen={isCreateProjOpen} onClose={() => setIsCreateProjOpen(false)} />
        )}
        {isCreateBoardOpen && activeProject && (
          <CreateBoardModal
            isOpen={isCreateBoardOpen}
            onClose={() => setIsCreateBoardOpen(false)}
            projectId={activeProject.id}
          />
        )}
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

  const getColumnColor = (name: string, defaultColor: string | null) => {
    const norm = name.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (norm.includes("todo") || norm.includes("backlog")) return "#FF8A3D"; // Orange
    if (norm.includes("progress") || norm.includes("active")) return "#3B82F6"; // Blue
    if (norm.includes("review") || norm.includes("qa") || norm.includes("test")) return "#A855F7"; // Purple
    if (norm.includes("done") || norm.includes("complete") || norm.includes("finish")) return "#22C55E"; // Green
    return defaultColor || "#3B82F6";
  };

  // --- RENDER STANDARD ACTIVE BOARD VIEW ---
  return (
    <PageContainer className="animate-fade-in select-none">
      {/* Header toolbar */}
      <PageHeader
        title={activeBoard.name}
        description={activeBoard.description || undefined}
        actions={
          <>
            <button
              onClick={handleFavoriteToggle}
              className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-amber-500 transition-colors cursor-pointer shrink-0"
              aria-label={isFavorited ? "Unfavorite board" : "Favorite board"}
            >
              <Star
                className={cn(
                  "w-4 h-4 transition-all duration-200",
                  isFavorited ? "text-amber-500 fill-amber-500" : "text-muted-foreground/35"
                )}
              />
            </button>

            <ViewSwitcher
              currentView={viewMode}
              onViewChange={(v) => updatePreference(v)}
            />
            {viewMode === "board" && (
              <ColumnNavigator
                columns={columns}
                columnRefs={columnRefs}
              />
            )}
            <button
              onClick={() => setIsActivityOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-foreground hover:bg-card-hover text-xs font-semibold transition-all cursor-pointer"
              aria-label="View activity history"
            >
              <History className="w-3.5 h-3.5" />
              <span>History</span>
            </button>
            {canManageBoard && (
              <button
                onClick={() => setIsEditOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-foreground hover:bg-card-hover text-xs font-semibold transition-all cursor-pointer"
                aria-label="Edit board"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Board</span>
              </button>
            )}
            {canManageBoard && (
              <button
                onClick={() => setIsColumnCreateOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-all cursor-pointer shadow-sm"
                aria-label="Create new column"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Column</span>
              </button>
            )}
          </>
        }
      />

      <ActionToolbar>
        <div className="flex items-center gap-2">
          <Link
            href="/boards"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-all font-semibold bg-secondary/50 border border-border/40 px-2.5 py-1 rounded-lg"
          >
            ← Back to Boards
          </Link>
        </div>
      </ActionToolbar>

      {/* Main Board view or List View */}
      <div className="flex-1 min-h-0 overflow-auto pt-4">
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
            columnRefs={columnRefs}
          />
        )}
      </div>

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
    </PageContainer>
  );
}
