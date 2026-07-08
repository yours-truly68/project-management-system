"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Loader2 } from "lucide-react";
import { useCreateBoard } from "../hooks/use-boards";
import { useProjectStore } from "@/stores/project.store";
import { getErrorMessage } from "@/lib/utils";

const createBoardSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name cannot exceed 100 characters"),
  description: z.string().optional(),
});

type CreateBoardFormData = z.infer<typeof createBoardSchema>;

interface CreateBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
}

export function CreateBoardModal({ isOpen, onClose, projectId }: CreateBoardModalProps) {
  const { activeProjectId } = useProjectStore();
  const { mutateAsync: createBoard, isPending, error } = useCreateBoard();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateBoardFormData>({
    resolver: zodResolver(createBoardSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      reset({
        name: "",
        description: "",
      });
    }
  }, [isOpen, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data: CreateBoardFormData) => {
    const targetProjectId = projectId || activeProjectId;
    if (!targetProjectId) return;
    try {
      await createBoard({
        project_id: targetProjectId,
        name: data.name,
        description: data.description || undefined,
      });
      reset();
      onClose();
    } catch {
      // Mutation handles error state
    }
  };

  const errorMessage = error ? getErrorMessage(error) : "";

  return (
    <div className="fixed inset-0 z-[var(--z-overlay)] flex items-center justify-center bg-black/75 backdrop-blur-[2px] animate-fade-in select-none">
      <div
        className="relative w-full max-w-md bg-white dark:bg-[#111820] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 m-4 animate-scale-in"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 dark:border-slate-800/60">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-foreground">Create Board</h3>
          <button
            onClick={onClose}
            className="text-slate-400 dark:text-muted-foreground hover:text-slate-600 dark:hover:text-foreground rounded p-1 transition-colors cursor-pointer"
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
              className="block text-[11px] font-bold text-slate-500 dark:text-muted-foreground uppercase tracking-wide"
            >
              Board Name<span className="text-rose-500 ml-0.5">*</span>
            </label>
            <input
              id="name"
              type="text"
              className="w-full h-9 text-xs px-3 rounded-lg bg-[#F4F6F8] dark:bg-[#050608] border border-slate-200 dark:border-slate-800 text-slate-950 dark:text-foreground placeholder-slate-400 dark:placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all"
              placeholder="e.g. Sprint 1 Board"
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
              htmlFor="description"
              className="block text-[11px] font-bold text-slate-500 dark:text-muted-foreground uppercase tracking-wide"
            >
              Description (Optional)
            </label>
            <textarea
              id="description"
              className="w-full text-xs px-3 py-2 rounded-lg bg-[#F4F6F8] dark:bg-[#050608] border border-slate-200 dark:border-slate-800 text-slate-950 dark:text-foreground placeholder-slate-400 dark:placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all min-h-[80px]"
              placeholder="Describe what tasks this board manages..."
              {...register("description")}
            />
            {errors.description && (
              <p className="text-[10px] text-destructive font-medium mt-0.5">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800/60 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 h-9 text-xs font-semibold rounded-lg bg-transparent border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-1.5 px-4 h-9 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Create Board
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateBoardModal;
