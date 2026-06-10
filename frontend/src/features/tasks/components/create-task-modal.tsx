"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Loader2 } from "lucide-react";
import { useCreateTask } from "../hooks/use-tasks";
import { TaskPriority } from "../types/task.types";
import { getErrorMessage } from "@/lib/utils";

const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title cannot exceed 100 characters"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
});

type CreateTaskFormData = z.infer<typeof createTaskSchema>;

interface CreateTaskModalProps {
  boardId: string;
  columnId: string;
  isOpen: boolean;
  onClose: () => void;
  nextPosition: number;
}

export function CreateTaskModal({
  boardId,
  columnId,
  isOpen,
  onClose,
  nextPosition,
}: CreateTaskModalProps) {
  const { mutateAsync: createTask, isPending, error } = useCreateTask(boardId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      priority: "MEDIUM",
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      reset({
        title: "",
        priority: "MEDIUM",
      });
    }
  }, [isOpen, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data: CreateTaskFormData) => {
    try {
      await createTask({
        column_id: columnId,
        title: data.title,
        priority: data.priority as TaskPriority,
        position: nextPosition,
      });
      onClose();
    } catch {
      // Mutation handles error state
    }
  };

  const errorMessage = error ? getErrorMessage(error) : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-[2px] animate-fade-in select-none">
      <div
        className="relative w-full max-w-md bg-card border border-border rounded-lg shadow-xl p-5 m-4 animate-scale-in"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Quick Create Task</h3>
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
          {/* Title */}
          <div className="space-y-1">
            <label
              htmlFor="task-title"
              className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wide"
            >
              Task Title
            </label>
            <input
              id="task-title"
              type="text"
              className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-all"
              placeholder="e.g. Implement authentication routing"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-[10px] text-destructive font-medium mt-0.5">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Priority */}
          <div className="space-y-1">
            <label
              htmlFor="task-priority"
              className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wide"
            >
              Priority
            </label>
            <select
              id="task-priority"
              className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-all cursor-pointer"
              {...register("priority")}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
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
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateTaskModal;
