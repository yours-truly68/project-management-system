"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuthStore } from "@/stores/auth.store";
import { useUpdateWorkspace, useDeleteWorkspace } from "../hooks/use-workspaces";
import { useWorkspaceMembers } from "../hooks/use-workspace-members";
import { Workspace } from "../types/workspace.types";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { getErrorMessage } from "@/lib/utils";

const workspaceSettingsSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name cannot exceed 100 characters"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100, "Slug cannot exceed 100 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens (e.g. 'my-workspace')"),
  description: z.string().nullable().optional(),
});

type WorkspaceSettingsFormData = z.infer<typeof workspaceSettingsSchema>;

interface WorkspaceSettingsProps {
  workspace: Workspace;
}

export function WorkspaceSettings({ workspace }: WorkspaceSettingsProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { members } = useWorkspaceMembers(workspace.id);
  const { mutateAsync: updateWorkspace, isPending: isUpdating } = useUpdateWorkspace(workspace.id);
  const { mutateAsync: deleteWorkspace, isPending: isDeleting } = useDeleteWorkspace();

  const [confirmSlug, setConfirmSlug] = React.useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [successMsg, setSuccessMsg] = React.useState("");
  const [errorMsg, setErrorMsg] = React.useState("");

  const currentUserMember = members.find((m) => m.user_id === user?.id);
  const isOwner = currentUserMember?.role === "OWNER";
  const isAdminOrOwner =
    currentUserMember?.role === "OWNER" || currentUserMember?.role === "ADMIN";

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isDirty },
    reset,
  } = useForm<WorkspaceSettingsFormData>({
    resolver: zodResolver(workspaceSettingsSchema),
    defaultValues: {
      name: workspace.name,
      slug: workspace.slug,
      description: workspace.description || "",
    },
  });

  // Reset form default values when active workspace changes
  React.useEffect(() => {
    reset({
      name: workspace.name,
      slug: workspace.slug,
      description: workspace.description || "",
    });
    setTimeout(() => {
      setSuccessMsg("");
      setErrorMsg("");
      setShowDeleteConfirm(false);
      setConfirmSlug("");
    }, 0);
  }, [workspace, reset]);

  const onSubmit = async (data: WorkspaceSettingsFormData) => {
    setSuccessMsg("");
    setErrorMsg("");
    try {
      await updateWorkspace({
        name: data.name,
        slug: data.slug,
        description: data.description || null,
      });
      setSuccessMsg("Workspace updated successfully!");
    } catch (err: unknown) {
      setErrorMsg(getErrorMessage(err));
    }
  };

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

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <div className="bg-secondary/20 rounded-xl border border-border p-6 space-y-4">
        <div>
          <h2 className="text-xl font-bold text-foreground/90 font-heading">General Settings</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Update workspace name, URL slug, and description details.
          </p>
        </div>

        {successMsg && (
          <div className="p-2.5 rounded border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 text-xs font-semibold leading-normal">
            {successMsg}
          </div>
        )}

        {errorMsg && !showDeleteConfirm && (
          <div className="p-2.5 rounded border border-destructive/20 bg-destructive/10 text-destructive text-xs font-semibold leading-normal">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
          <div className="space-y-1">
            <label
              htmlFor="settings-name"
              className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wide"
            >
              Workspace Name
            </label>
            <input
              id="settings-name"
              type="text"
              disabled={isUpdating || !isAdminOrOwner}
              className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-all disabled:opacity-50"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-[10px] text-destructive font-medium mt-0.5">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label
              htmlFor="settings-slug"
              className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wide"
            >
              Workspace URL Slug
            </label>
            <div className="flex rounded-lg border border-border bg-background focus-within:ring-1 focus-within:ring-ring focus-within:border-ring transition-all overflow-hidden">
              <span className="flex items-center text-muted-foreground/60 text-xs px-2.5 py-1.5 bg-secondary border-r border-border font-medium">
                /workspaces/
              </span>
              <input
                id="settings-slug"
                type="text"
                disabled={isUpdating || !isAdminOrOwner}
                className="w-full text-xs px-2.5 py-1.5 bg-transparent border-0 text-foreground placeholder-muted-foreground/60 focus:outline-none disabled:opacity-50"
                {...register("slug")}
                onChange={(e) => {
                  setValue("slug", e.target.value.toLowerCase(), {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
              />
            </div>
            {errors.slug && (
              <p className="text-[10px] text-destructive font-medium mt-0.5">
                {errors.slug.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label
              htmlFor="settings-description"
              className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wide"
            >
              Description
            </label>
            <textarea
              id="settings-description"
              disabled={isUpdating || !isAdminOrOwner}
              className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-all disabled:opacity-50 min-h-[80px]"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-[10px] text-destructive font-medium mt-0.5">
                {errors.description.message}
              </p>
            )}
          </div>

          {isAdminOrOwner && (
            <button
              type="submit"
              disabled={isUpdating || !isDirty}
              className="flex justify-center items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-semibold rounded-lg shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 cursor-pointer min-h-[32px]"
            >
              {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Save Changes
            </button>
          )}
        </form>
      </div>

      {/* Danger Zone (Delete Workspace) */}
      {isOwner && (
        <div className="bg-rose-500/5 rounded-xl border border-rose-500/20 p-6 space-y-4 animate-fade-in">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-xl font-bold text-rose-500 font-heading">Danger Zone</h2>
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
      )}
    </div>
  );
}
export default WorkspaceSettings;
