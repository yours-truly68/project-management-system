"use client";

import * as React from "react";
import { useWorkspaces } from "@/features/workspaces/hooks/use-workspaces";
import { WorkspaceMemberList } from "@/features/workspaces/components/workspace-member-list";
import { Loader2 } from "lucide-react";

export default function WorkspaceMembersPage() {
  const { activeWorkspace, isLoading } = useWorkspaces();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!activeWorkspace) {
    return (
      <div className="bg-secondary/20 rounded-xl border border-border p-8 text-center max-w-xl">
        <h2 className="text-lg font-bold text-foreground/90 font-heading">No Active Workspace</h2>
        <p className="text-xs text-muted-foreground mt-2">
          You must select or create a workspace first to view its members.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 select-none">
      <WorkspaceMemberList workspace={activeWorkspace} />
    </div>
  );
}
