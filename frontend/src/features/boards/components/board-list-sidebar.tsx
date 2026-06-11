"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LayoutGrid, Plus, Loader2 } from "lucide-react";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { useWorkspaceMembers } from "@/features/workspaces/hooks/use-workspace-members";
import { useAuthStore } from "@/stores/auth.store";
import { useProjectStore } from "@/stores/project.store";
import { useBoards } from "../hooks/use-boards";
import { CreateBoardModal } from "./create-board-modal";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BoardListSidebarProps {
  isCollapsed: boolean;
}

function SidebarTooltip({
  content,
  disabled,
  children,
}: {
  content: string;
  disabled?: boolean;
  children: React.ReactElement;
}) {
  if (disabled) return children;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={12}>
        {content}
      </TooltipContent>
    </Tooltip>
  );
}

export function BoardListSidebar({ isCollapsed }: BoardListSidebarProps) {
  const router = useRouter();
  const { activeWorkspaceId } = useWorkspaceStore();
  const { activeProjectId } = useProjectStore();
  const { user } = useAuthStore();
  const { members } = useWorkspaceMembers(activeWorkspaceId);
  const { boards, activeBoardId, setActiveBoardId, isLoading } = useBoards();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Permission check: only OWNER and ADMIN can create boards in this workspace
  const currentUserMember = members.find((m) => m.user_id === user?.id);
  const canCreate =
    currentUserMember?.role === "OWNER" || currentUserMember?.role === "ADMIN";

  // Hide boards section if no project is active
  if (!activeProjectId) return null;

  return (
    <div className="space-y-0.5">
      {/* Header */}
      {!isCollapsed ? (
        <div className="flex items-center justify-between px-2.5 py-1">
          <span className="text-[11px] font-bold text-sidebar-foreground/45 uppercase tracking-wider">
            Boards
          </span>
          {canCreate && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
              aria-label="Create new board"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ) : (
        canCreate && (
          <div className="flex justify-center py-1">
            <SidebarTooltip content="Create new board">
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded p-1 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
                aria-label="Create new board"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </SidebarTooltip>
          </div>
        )
      )}

      {/* Boards list or loading/empty state */}
      <div className="space-y-0.5">
        {isLoading ? (
          <div className="flex items-center justify-center py-3 text-sidebar-foreground/50">
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            {!isCollapsed && <span className="text-xs ml-2">Loading boards...</span>}
          </div>
        ) : boards.length === 0 ? (
          !isCollapsed && (
            <div className="px-2.5 py-2 text-xs text-sidebar-foreground/45 italic">
              No boards yet.
            </div>
          )
        ) : (
          boards.map((board) => {
            const isActive = board.id === activeBoardId;

            return (
              <SidebarTooltip
                key={board.id}
                content={board.name}
                disabled={!isCollapsed}
              >
                <button
                  onClick={() => {
                    setActiveBoardId(board.id);
                    router.push("/");
                  }}
                  className={cn(
                    "flex items-center gap-2.5 px-2.5 py-1.5 rounded-r-md border-l-2 text-[15px] text-sidebar-foreground/70 hover:text-sidebar-foreground w-full text-left transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer",
                    isActive
                      ? "bg-sidebar-accent border-primary text-sidebar-foreground font-semibold"
                      : "border-transparent hover:bg-sidebar-accent/40",
                    isCollapsed && "justify-center px-0 border-l-0 rounded-md"
                  )}
                  aria-label={`Board: ${board.name}`}
                >
                  <LayoutGrid className="w-3.5 h-3.5 text-sidebar-foreground/60 shrink-0" />
                  {!isCollapsed && (
                    <span className="truncate text-[15px] font-medium flex-1">
                      {board.name}
                    </span>
                  )}
                </button>
              </SidebarTooltip>
            );
          })
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <CreateBoardModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}

export default BoardListSidebar;
