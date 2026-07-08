"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Loader2 } from "lucide-react";
import { useUpdateProject } from "../hooks/use-projects";
import { Project } from "../types/project.types";
import { getErrorMessage } from "@/lib/utils";

const editProjectSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name cannot exceed 100 characters"),
  key: z
    .string()
    .min(2, "Key must be at least 2 characters")
    .max(10, "Key cannot exceed 10 characters")
    .regex(/^[A-Z0-9]+$/, "Key must contain only uppercase letters and numbers"),
  description: z.string().optional(),
});

type EditProjectFormData = z.infer<typeof editProjectSchema>;

interface EditProjectModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
}

export function EditProjectModal({ project, isOpen, onClose }: EditProjectModalProps) {
  const { mutateAsync: updateProject, isPending, error } = useUpdateProject(project.id);
  const [isKeyManuallyEdited, setIsKeyManuallyEdited] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EditProjectFormData>({
    resolver: zodResolver(editProjectSchema),
    defaultValues: {
      name: project.name,
      key: project.key,
      description: project.description || "",
    },
  });

  const nameValue = watch("name");

  React.useEffect(() => {
    if (isOpen) {
      reset({
        name: project.name,
        key: project.key,
        description: project.description || "",
      });
      setIsKeyManuallyEdited(false);
    }
  }, [isOpen, project, reset]);

  React.useEffect(() => {
    if (!isKeyManuallyEdited && nameValue && nameValue !== project.name) {
      const generatedKey = nameValue
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .substring(0, 10);
      setValue("key", generatedKey, { shouldValidate: true });
    }
  }, [nameValue, isKeyManuallyEdited, setValue, project.name]);

  if (!isOpen) return null;

  const onSubmit = async (data: EditProjectFormData) => {
    try {
      await updateProject({
        name: data.name,
        key: data.key,
        description: data.description || null,
      });
      onClose();
    } catch {
      // Mutation handles error state
    }
  };

  const errorMessage = error ? getErrorMessage(error) : "";

  return (
    <div className="fixed inset-0 z-[var(--z-overlay)] flex items-center justify-center bg-black/75 backdrop-blur-[2px] animate-fade-in select-none">
      <div
        className="relative w-full max-w-md bg-elevated border border-border/60 rounded-dialog shadow-2xl p-dialog-pad m-4 animate-scale-in"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-border/20">
          <h3 className="text-sm font-semibold text-foreground">Edit Project</h3>
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
              Project Name<span className="text-rose-500 ml-0.5">*</span>
            </label>
            <input
              id="name"
              type="text"
              className="w-full h-[var(--height-control-md)] text-xs px-3 rounded-button bg-background border border-border text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-all"
              placeholder="e.g. Mobile Application"
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
              htmlFor="key"
              className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wide"
            >
              Project Key<span className="text-rose-500 ml-0.5">*</span>
            </label>
            <div className="flex rounded-button border border-border bg-background focus-within:ring-1 focus-within:ring-ring focus-within:border-ring transition-all overflow-hidden h-[var(--height-control-md)]">
              <span className="flex items-center text-muted-foreground/60 text-[10px] px-3 bg-secondary border-r border-border font-bold uppercase shrink-0">
                KEY
              </span>
              <input
                id="key"
                type="text"
                className="w-full text-xs px-3 bg-transparent border-0 text-foreground placeholder-muted-foreground/60 focus:outline-none uppercase"
                placeholder="e.g. MAP"
                {...register("key")}
                onChange={(e) => {
                  setIsKeyManuallyEdited(true);
                  setValue("key", e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""), {
                    shouldValidate: true,
                  });
                }}
              />
            </div>
            {errors.key && (
              <p className="text-[10px] text-destructive font-medium mt-0.5">
                {errors.key.message}
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
              className="w-full text-xs px-3 py-2 rounded-button bg-background border border-border text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-all min-h-[80px]"
              placeholder="Describe your project..."
              {...register("description")}
            />
            {errors.description && (
              <p className="text-[10px] text-destructive font-medium mt-0.5">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border/20 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 h-[var(--height-control-md)] text-xs font-semibold rounded-button bg-secondary border border-border text-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-1.5 px-4 h-[var(--height-control-md)] text-xs font-semibold rounded-button bg-primary text-primary-foreground hover:bg-primary/95 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProjectModal;
