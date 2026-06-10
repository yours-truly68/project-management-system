"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Loader2 } from "lucide-react";
import { useCreateWorkspace } from "../hooks/use-workspaces";
import { getErrorMessage } from "@/lib/utils";

const createWorkspaceSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name cannot exceed 100 characters"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100, "Slug cannot exceed 100 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens (e.g. 'my-workspace')"),
  description: z.string().optional(),
});

type CreateWorkspaceFormData = z.infer<typeof createWorkspaceSchema>;

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateWorkspaceModal({ isOpen, onClose }: CreateWorkspaceModalProps) {
  const { mutateAsync: createWorkspace, isPending, error } = useCreateWorkspace();
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateWorkspaceFormData>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
    },
  });

  const nameValue = watch("name");

  React.useEffect(() => {
    if (!isSlugManuallyEdited && nameValue) {
      const slugified = nameValue
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setValue("slug", slugified, { shouldValidate: true });
    }
  }, [nameValue, isSlugManuallyEdited, setValue]);

  if (!isOpen) return null;

  const onSubmit = async (data: CreateWorkspaceFormData) => {
    try {
      await createWorkspace(data);
      reset();
      setIsSlugManuallyEdited(false);
      onClose();
    } catch {
      // Mutation handles error state
    }
  };

  const errorMessage = error ? getErrorMessage(error) : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-[1px] animate-fade-in select-none">
      <div
        className="relative w-full max-w-md bg-[#1B212B] border border-[#242B36] rounded-lg shadow-[0_20px_40px_rgba(0,0,0,0.45)] p-5 m-4 animate-scale-in"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Create Workspace</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground rounded p-1 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-3.5 p-2.5 rounded border border-destructive/20 bg-destructive/10 text-destructive text-xs font-semibold leading-normal">
            {errorMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div className="space-y-1">
            <label
              htmlFor="name"
              className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wide"
            >
              Workspace Name
            </label>
            <input
              id="name"
              type="text"
              className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-all"
              placeholder="e.g. Acme Corporation"
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
              htmlFor="slug"
              className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wide"
            >
              Workspace URL Slug
            </label>
            <div className="flex rounded-lg border border-border bg-background focus-within:ring-1 focus-within:ring-ring focus-within:border-ring transition-all overflow-hidden">
              <span className="flex items-center text-muted-foreground/60 text-xs px-2.5 py-1.5 bg-secondary border-r border-border font-medium">
                /workspaces/
              </span>
              <input
                id="slug"
                type="text"
                className="w-full text-xs px-2.5 py-1.5 bg-transparent border-0 text-foreground placeholder-muted-foreground/60 focus:outline-none"
                placeholder="acme-corp"
                {...register("slug")}
                onChange={(e) => {
                  setIsSlugManuallyEdited(true);
                  setValue("slug", e.target.value.toLowerCase(), { shouldValidate: true });
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
              htmlFor="description"
              className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wide"
            >
              Description (Optional)
            </label>
            <textarea
              id="description"
              className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-all min-h-[80px]"
              placeholder="Describe your workspace..."
              {...register("description")}
            />
            {errors.description && (
              <p className="text-[10px] text-destructive font-medium mt-0.5">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2.5 pt-2 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-secondary border border-border text-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default CreateWorkspaceModal;
