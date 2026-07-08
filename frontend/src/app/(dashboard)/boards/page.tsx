"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import { useBoards, useDeleteBoard } from "@/features/boards/hooks/use-boards";
import { useProject, useProjects } from "@/features/projects/hooks/use-projects";
import { useTasks } from "@/features/tasks/hooks/use-tasks";
import { useProjectStore } from "@/stores/project.store";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { useWorkspaceMembers } from "@/features/workspaces/hooks/use-workspace-members";
import { useAuthStore } from "@/stores/auth.store";
import { Board } from "@/features/boards/types/board.types";
import { CreateBoardModal } from "@/features/boards/components/create-board-modal";
import { EditBoardModal } from "@/features/boards/components/edit-board-modal";
import { BoardEmptyState } from "@/features/boards/components/board-empty-state";
import {
  Plus,
  Loader2,
  Edit3,
  Trash2,
  Check,
  AlertTriangle,
  X,
  Calendar,
  MoreHorizontal,
  Star,
  Folder,
  LayoutGrid,
  History,
  TrendingUp,
} from "lucide-react";
import { getErrorMessage, cn } from "@/lib/utils";
import { useFavorites, useCreateFavorite, useDeleteFavorite } from "@/features/favorites/hooks/use-favorites";
import { useBoardStore } from "@/stores/board.store";
import { useWorkspaces } from "@/features/workspaces/hooks/use-workspaces";
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
  ActivityItem,
  Timeline,
} from "@/components/ui/primitives";

interface BoardCardProps {
  board: Board;
  projectKey?: string;
  isActive: boolean;
  canManage: boolean;
  activeMenuId: string | null;
  setActiveMenuId: (id: string | null) => void;
  onEdit: (board: Board) => void;
  onDelete: (board: Board) => void;
  onSelect: (id: string) => void;
}

function BoardCard({
  board,
  projectKey,
  isActive,
  canManage,
  activeMenuId,
  setActiveMenuId,
  onEdit,
  onDelete,
  onSelect,
}: BoardCardProps) {
  const { data: tasks = [] } = useTasks(board.id);
  const { data: favorites = [] } = useFavorites();
  const { mutate: createFavorite } = useCreateFavorite();
  const { mutate: deleteFavorite } = useDeleteFavorite();

  const matchingFavorite = favorites.find(
    (fav) => fav.entity_type === "board" && fav.entity_id === board.id
  );
  const isFavorited = !!matchingFavorite;

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFavorited && matchingFavorite) {
      deleteFavorite(matchingFavorite.id);
    } else {
      createFavorite({ entity_type: "board", entity_id: board.id });
    }
  };

  const lastUpdated = new Date(board.updated_at).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  return (
    <EntityCard
      title={board.name}
      description={board.description || "No description provided."}
      onClick={() => onSelect(board.id)}
      className={cn(
        isActive && "border-primary bg-accent/10"
      )}
      icon={<LayoutGrid className="w-4 h-4 text-primary shrink-0" />}
      actions={
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={handleFavoriteToggle}
            className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-amber-500 transition-colors cursor-pointer shrink-0"
            aria-label={isFavorited ? "Unfavorite board" : "Favorite board"}
          >
            <Star
              className={cn(
                "w-3.5 h-3.5 transition-all duration-200",
                isFavorited ? "text-amber-500 fill-amber-500" : "text-muted-foreground/35"
              )}
            />
          </button>

          {canManage && (
            <div className="relative">
              <button
                onClick={() => setActiveMenuId(activeMenuId === board.id ? null : board.id)}
                className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-all cursor-pointer focus-visible:outline-none"
                aria-label="Board actions"
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>

              {activeMenuId === board.id && (
                <div className="absolute right-0 mt-1.5 w-36 rounded-lg border border-border bg-elevated shadow-xl py-1 z-30 animate-fade-in text-left select-none glass">
                  <button
                    onClick={() => {
                      onEdit(board);
                      setActiveMenuId(null);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-foreground hover:bg-background/80 transition-colors text-left cursor-pointer font-medium"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>Edit Board</span>
                  </button>
                  <button
                    onClick={() => {
                      onDelete(board);
                      setActiveMenuId(null);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-500 hover:bg-rose-500/10 transition-colors text-left cursor-pointer font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Board</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      }
      metadata={
        <div className="flex items-center justify-between w-full text-[10px] text-muted-foreground font-medium pt-2 border-t border-border/10">
          <span>{tasks.length} tasks</span>
          <span>Updated {lastUpdated}</span>
        </div>
      }
    />
  );
}

export default function BoardsPage() {
  const router = useRouter();
  const { activeWorkspace } = useWorkspaces();
  const { activeWorkspaceId } = useWorkspaceStore();
  const { activeProjectId, setActiveProjectId } = useProjectStore();
  const { user } = useAuthStore();
  const { members } = useWorkspaceMembers(activeWorkspaceId);
  const { projects } = useProjects();
  const { boards, activeBoardId, setActiveBoardId, isLoading } = useBoards();
  const { mutateAsync: deleteBoard, isPending: isDeleting } = useDeleteBoard();
  const { data: project } = useProject(activeProjectId);

  // Dialog / Modal states
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [boardToEdit, setBoardToEdit] = React.useState<Board | null>(null);
  const [boardToDelete, setBoardToDelete] = React.useState<Board | null>(null);
  const [confirmName, setConfirmName] = React.useState("");
  const [deleteError, setDeleteError] = React.useState("");
  const [activeMenuId, setActiveMenuId] = React.useState<string | null>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (!target.closest(".board-menu-trigger") && !target.closest(".board-menu-dropdown")) {
        setActiveMenuId(null);
      }
    }
    if (activeMenuId !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeMenuId]);

  // Determine permissions
  const currentUserMember = members.find((m) => m.user_id === user?.id);
  const role = currentUserMember?.role || "MEMBER";
  const canManage = role === "OWNER" || role === "ADMIN";

  const handleDeleteConfirm = async () => {
    if (!boardToDelete) return;
    if (confirmName !== boardToDelete.name) {
      setDeleteError("Typed name does not match.");
      return;
    }
    try {
      await deleteBoard(boardToDelete.id);
      setBoardToDelete(null);
      setConfirmName("");
      setDeleteError("");
    } catch (err) {
      setDeleteError(getErrorMessage(err));
    }
  };

  const handleSelectBoard = (boardId: string) => {
    setActiveBoardId(boardId);
    router.push("/");
  };

  const workspaceActivities = useActivities(activeWorkspaceId);

  // Fetch all boards across the workspace to display favorite boards if no active project
  const boardsQueries = useQueries({
    queries: projects.map((p) => ({
      queryKey: ["boards", p.id],
      queryFn: () => boardService.listBoards(p.id),
      enabled: !activeProjectId,
    })),
  });

  const allWorkspaceBoards = React.useMemo(() => {
    return boardsQueries.flatMap((q) => q.data || []);
  }, [boardsQueries]);

  const { data: favorites = [] } = useFavorites();
  const favBoards = React.useMemo(() => {
    const ids = new Set(favorites.filter((f) => f.entity_type === "board").map((f) => f.entity_id));
    return allWorkspaceBoards.filter((b) => ids.has(b.id));
  }, [favorites, allWorkspaceBoards]);

  if (isLoading) {
    return (
      <PageContainer className="animate-pulse">
        <div className="h-8 w-48 bg-accent/30 rounded-lg mb-6" />
        <div className="h-40 bg-accent/20 rounded-xl" />
      </PageContainer>
    );
  }

  if (!activeWorkspaceId) {
    return (
      <PageContainer className="flex items-center justify-center p-8">
        <EmptyState
          title="No Active Workspace"
          description="Select or create a workspace from the sidebar to manage boards."
          icon={LayoutGrid}
        />
      </PageContainer>
    );
  }

  // GUIDANCE PAGE (if no project is active)
  if (!activeProjectId) {
    return (
      <PageContainer className="animate-fade-in select-none">
        <PageHeader
          title="Boards Dashboard"
          description="Select a project below to manage its task boards and columns."
        />

        <SplitLayout
          sidebar={
            <PageSidebar>
              {/* Favorite Boards Widget */}
              <div>
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  Favorite Boards
                </h4>
                <div className="space-y-2">
                  {favBoards.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        setActiveProjectId(b.project_id);
                        setActiveBoardId(b.id);
                        router.push("/");
                      }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-secondary/40 text-left text-xs font-semibold"
                    >
                      <LayoutGrid className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                      <span className="truncate flex-1">{b.name}</span>
                    </button>
                  ))}
                  {favBoards.length === 0 && (
                    <span className="text-xs text-muted-foreground/50 block py-2 text-center">
                      No favorite boards.
                    </span>
                  )}
                </div>
              </div>
            </PageSidebar>
          }
        >
          <div className="space-y-6">
            {/* Project Selector Grid */}
            <div>
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                Select a Project
              </h3>
              <ContentGrid>
                {projects.map((proj) => (
                  <EntityCard
                    key={proj.id}
                    title={proj.name}
                    description={proj.description || "No description provided."}
                    icon={<Folder className="w-4 h-4 text-primary shrink-0" />}
                    onClick={() => {
                      setActiveProjectId(proj.id);
                      setActiveBoardId(null);
                    }}
                    metadata={
                      <div className="text-[10px] text-muted-foreground font-semibold">
                        Key: {proj.key}
                      </div>
                    }
                  />
                ))}
              </ContentGrid>
            </div>

            {/* Workspace activity feed */}
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
      </PageContainer>
    );
  }

  // MAIN ACTIVE PROJECT BOARDS GRID
  return (
    <PageContainer className="animate-fade-in select-none">
      <PageHeader
        title="Boards"
        description="Manage, select, and organize task pipelines inside the active project."
        actions={
          canManage && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Create Board
            </button>
          )
        }
      />

      <ActionToolbar>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveProjectId(null);
              router.push("/projects");
            }}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-all font-semibold bg-secondary/50 border border-border/40 px-2.5 py-1 rounded-lg cursor-pointer"
          >
            ← Back to Projects
          </button>
        </div>
      </ActionToolbar>

      {/* Main split */}
      <SplitLayout
        sidebar={
          <PageSidebar>
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full select-none">
                Project Overview
              </span>
              <h3 className="font-bold text-base text-foreground mt-3 truncate" title={project?.name}>
                {project?.name || "Loading..."}
              </h3>
              <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                Key: {project?.key || "loading"}
              </p>
            </div>

            {project?.description && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {project.description}
              </p>
            )}

            <div className="border-t border-border/20 pt-4">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">
                Project Stats
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-secondary/40 border border-border/20 p-2.5 rounded-xl text-center">
                  <span className="block text-lg font-bold text-foreground">{boards.length}</span>
                  <span className="text-[9px] text-muted-foreground uppercase font-medium">Boards</span>
                </div>
                <div className="bg-secondary/40 border border-border/20 p-2.5 rounded-xl text-center">
                  <span className="block text-lg font-bold text-foreground">{members.length}</span>
                  <span className="text-[9px] text-muted-foreground uppercase font-medium">Members</span>
                </div>
              </div>
            </div>
          </PageSidebar>
        }
      >
        {boards.length === 0 ? (
          <BoardEmptyState />
        ) : (
          <ContentGrid>
            {boards.map((board) => (
              <BoardCard
                key={board.id}
                board={board}
                projectKey={project?.key}
                isActive={board.id === activeBoardId}
                canManage={canManage}
                activeMenuId={activeMenuId}
                setActiveMenuId={setActiveMenuId}
                onEdit={setBoardToEdit}
                onDelete={setBoardToDelete}
                onSelect={handleSelectBoard}
              />
            ))}
          </ContentGrid>
        )}
      </SplitLayout>

      {/* Modals & Dialogs */}
      {isCreateOpen && (
        <CreateBoardModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} projectId={activeProjectId} />
      )}

      {boardToEdit && (
        <EditBoardModal
          board={boardToEdit}
          isOpen={!!boardToEdit}
          onClose={() => setBoardToEdit(null)}
        />
      )}

      {boardToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-[2px] animate-fade-in select-none">
          <div
            className="relative w-full max-w-md bg-elevated border border-border rounded-[20px] shadow-2xl p-5 m-4 animate-scale-in"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                Delete Board
              </h3>
              <button
                onClick={() => {
                  setBoardToDelete(null);
                  setConfirmName("");
                  setDeleteError("");
                }}
                className="text-muted-foreground hover:text-foreground rounded p-1 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3.5 space-y-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Are you sure you want to delete the board &ldquo;{boardToDelete.name}&rdquo;?
                This action cannot be undone and will permanently delete all associated columns,
                tasks, and data.
              </p>

              {deleteError && (
                <div className="p-2.5 rounded border border-destructive/20 bg-destructive/10 text-destructive text-xs font-semibold leading-normal">
                  {deleteError}
                </div>
              )}

              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-rose-500">
                  To confirm, type <span className="font-semibold text-rose-500 select-all">{boardToDelete.name}</span> below:
                </p>
                <input
                  type="text"
                  value={confirmName}
                  onChange={(e) => setConfirmName(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-all"
                  placeholder="Type board name to confirm..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-4 mt-4 border-t border-border">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  setBoardToDelete(null);
                  setConfirmName("");
                  setDeleteError("");
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-secondary border border-border text-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={confirmName !== boardToDelete.name || isDeleting}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Delete Board
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
