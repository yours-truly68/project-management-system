"use client";

import * as React from "react";
import { FolderPlus, Plus, Sparkles } from "lucide-react";
import { CreateProjectModal } from "./create-project-modal";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { useWorkspaceMembers } from "@/features/workspaces/hooks/use-workspace-members";
import { useAuthStore } from "@/stores/auth.store";
import { EmptyState } from "@/components/ui/primitives";

export function ProjectEmptyState() {
  const { activeWorkspaceId } = useWorkspaceStore();
  const { user } = useAuthStore();
  const { members } = useWorkspaceMembers(activeWorkspaceId);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Permission check: only OWNER and ADMIN can create projects in this workspace
  const currentUserMember = members.find((m) => m.user_id === user?.id);
  const canCreate =
    currentUserMember?.role === "OWNER" || currentUserMember?.role === "ADMIN";

  return (
    <div className="flex-1 flex items-center justify-center p-8 select-none animate-fade-in relative overflow-hidden">
      <div className="absolute inset-0 dots-pattern opacity-60" />
      <EmptyState
        title="Create your first project"
        description="Projects are where your boards, tasks, and team members live. Start by creating a project for your workspace."
        icon={FolderPlus}
        primaryAction={
          canCreate ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all duration-200 cursor-pointer shadow-sm btn-interactive"
            >
              <Plus className="w-4 h-4" />
              Create Project
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs text-muted-foreground/70 justify-center">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="italic">Only workspace owners or administrators can create projects.</span>
            </div>
          )
        }
      />
      {isModalOpen && (
        <CreateProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}

export default ProjectEmptyState;
