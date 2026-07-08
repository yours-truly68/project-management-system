"use client";

import * as React from "react";
import { LayoutGrid, Plus, Sparkles } from "lucide-react";
import { CreateBoardModal } from "./create-board-modal";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { useWorkspaceMembers } from "@/features/workspaces/hooks/use-workspace-members";
import { useAuthStore } from "@/stores/auth.store";
import { EmptyState } from "@/components/ui/primitives";

export function BoardEmptyState() {
  const { activeWorkspaceId } = useWorkspaceStore();
  const { user } = useAuthStore();
  const { members } = useWorkspaceMembers(activeWorkspaceId);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Permission check: only OWNER and ADMIN can create boards in this workspace
  const currentUserMember = members.find((m) => m.user_id === user?.id);
  const canCreate =
    currentUserMember?.role === "OWNER" || currentUserMember?.role === "ADMIN";

  return (
    <div className="flex-1 flex items-center justify-center p-8 select-none animate-fade-in relative overflow-hidden">
      <div className="absolute inset-0 dots-pattern opacity-60" />
      <EmptyState
        title="Create your first board"
        description="Boards organize your workflow into columns and tasks. Start by creating a board for your project."
        icon={LayoutGrid}
        primaryAction={
          canCreate ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all duration-200 cursor-pointer shadow-sm btn-interactive"
            >
              <Plus className="w-4 h-4" />
              Create Board
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs text-muted-foreground/70 justify-center">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="italic">Only workspace owners or administrators can create boards.</span>
            </div>
          )
        }
      />
      {isModalOpen && (
        <CreateBoardModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}

export default BoardEmptyState;
