"use client";

import * as React from "react";
import { LayoutGrid, Plus } from "lucide-react";
import { CreateColumnModal } from "./create-column-modal";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { useWorkspaceMembers } from "@/features/workspaces/hooks/use-workspace-members";
import { useAuthStore } from "@/stores/auth.store";

interface ColumnEmptyStateProps {
  boardId: string;
}

export function ColumnEmptyState({ boardId }: ColumnEmptyStateProps) {
  const { activeWorkspaceId } = useWorkspaceStore();
  const { user } = useAuthStore();
  const { members } = useWorkspaceMembers(activeWorkspaceId);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Permission check: only OWNER and ADMIN can create columns in this workspace
  const currentUserMember = members.find((m) => m.user_id === user?.id);
  const canCreate =
    currentUserMember?.role === "OWNER" || currentUserMember?.role === "ADMIN";

  return (
    <div className="flex flex-col items-center justify-center min-h-[450px] p-8 text-center rounded-xl border border-dashed border-border bg-card/40 animate-fade-in select-none">
      <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
        <LayoutGrid className="w-6 h-6" />
      </div>

      <h3 className="text-base font-semibold text-foreground mb-1">
        No columns found
      </h3>
      <p className="text-xs text-muted-foreground max-w-sm mb-6 leading-relaxed">
        This board has no columns yet. Create columns to organize your tasks.
      </p>

      {canCreate ? (
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create First Column
        </button>
      ) : (
        <p className="text-xs text-muted-foreground/80 italic">
          Only workspace owners or administrators can create columns.
        </p>
      )}

      {isModalOpen && (
        <CreateColumnModal
          boardId={boardId}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          nextPosition={0}
        />
      )}
    </div>
  );
}

export default ColumnEmptyState;
