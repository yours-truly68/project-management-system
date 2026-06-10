"use client";

import * as React from "react";
import { useAuthStore } from "@/stores/auth.store";
import { useDeleteWorkspace } from "../hooks/use-workspaces";
import { useWorkspaceMembers } from "../hooks/use-workspace-members";
import { Workspace } from "../types/workspace.types";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { getErrorMessage } from "@/lib/utils";

interface WorkspaceDangerZoneProps {
  workspace: Workspace;
}

export function WorkspaceDangerZone({ workspace }: WorkspaceDangerZoneProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { members, isLoading: membersLoading } = useWorkspaceMembers(workspace.id);
  const { mutateAsync: deleteWorkspace, isPending: isDeleting } = useDeleteWorkspace();

  const [confirmSlug, setConfirmSlug] = React.useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");

  const currentUserMember = members.find((m) => m.user_id === user?.id);
  const isOwner = currentUserMember?.role === "OWNER";

  // Reset confirmation when workspace changes
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowDeleteConfirm(false);
      setConfirmSlug("");
      setErrorMsg("");
    }, 0);
    return () => clearTimeout(timer);
  }, [workspace]);

  const handleDelete = async () => {
    if (confirmSlug !== workspace.slug) return;
    setErrorMsg("");
    try {
      await deleteWorkspace(workspace.id);
      router.push("/settings");
    } catch (err: unknown) {
      setErrorMsg(getErrorMessage(err));
    }
  };

  if (membersLoading) {
    return (
      <div className="flex justify-center items-center py-6">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="bg-secondary/20 rounded-xl border border-border p-6 text-center max-w-xl">
        <h2 className="text-lg font-bold text-foreground/90 font-heading">Access Denied</h2>
        <p className="text-xs text-muted-foreground mt-2">
          Only the Workspace Owner is allowed to perform destructive deletions in the Danger Zone.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-rose-500/5 rounded-xl border border-rose-500/20 p-6 space-y-4 max-w-2xl select-none">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
        <div>
          <h2 className="text-sm font-semibold text-rose-500">Delete Workspace</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Once you delete a workspace, there is no going back. All projects, boards, tasks,
            and members will be permanently deleted.
          </p>
        </div>
      </div>

      {!showDeleteConfirm ? (
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-rose-500/30 hover:bg-rose-500/10 text-rose-500 text-xs font-bold transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Delete Workspace
          </button>
        </div>
      ) : (
        <div className="pt-2 space-y-3.5 max-w-md">
          {errorMsg && (
            <div className="p-2.5 rounded border border-destructive/20 bg-destructive/10 text-destructive text-xs font-semibold leading-normal animate-fade-in">
              {errorMsg}
            </div>
          )}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-foreground">
              To confirm, type{" "}
              <span className="font-bold font-mono text-rose-500 select-all">
                {workspace.slug}
              </span>{" "}
              below:
            </p>
            <input
              type="text"
              value={confirmSlug}
              onChange={(e) => setConfirmSlug(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-all"
              placeholder="Type the slug here..."
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={confirmSlug !== workspace.slug || isDeleting}
              className="flex items-center gap-1 px-3.5 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all disabled:opacity-40 disabled:hover:bg-rose-500 cursor-pointer"
            >
              {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Confirm Deletion
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => {
                setShowDeleteConfirm(false);
                setConfirmSlug("");
              }}
              className="px-3.5 py-2 rounded-lg border border-border text-foreground hover:bg-secondary text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkspaceDangerZone;
