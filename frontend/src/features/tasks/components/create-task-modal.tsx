"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Loader2 } from "lucide-react";
import { useCreateTask } from "../hooks/use-tasks";
import { TaskPriority } from "../types/task.types";
import { WorkspaceMemberDetailed } from "@/features/workspaces/types/workspace.types";
import { getErrorMessage } from "@/lib/utils";

const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title cannot exceed 100 characters"),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  assignee_id: z.string().optional().nullable(),
  due_date: z.string().optional().nullable(),
});

type CreateTaskFormData = z.infer<typeof createTaskSchema>;

interface CreateTaskModalProps {
  boardId: string;
  columnId: string;
  isOpen: boolean;
  onClose: () => void;
  nextPosition: number;
  members: WorkspaceMemberDetailed[];
}

export function CreateTaskModal({
  boardId,
  columnId,
  isOpen,
  onClose,
  nextPosition,
  members,
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
      description: "",
      priority: "MEDIUM",
      assignee_id: "",
      due_date: "",
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      reset({
        title: "",
        description: "",
        priority: "MEDIUM",
        assignee_id: "",
        due_date: "",
      });
    }
  }, [isOpen, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data: CreateTaskFormData) => {
    try {
      await createTask({
        column_id: columnId,
        title: data.title,
        description: data.description || null,
        priority: data.priority as TaskPriority,
        assignee_id: data.assignee_id || null,
        due_date: data.due_date ? new Date(data.due_date).toISOString() : null,
        position: nextPosition,
      });
      onClose();
    } catch {
      // Mutation handles error state
    }
  };

  const errorMessage = error ? getErrorMessage(error) : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-[2px] animate-fade-in select-none">
      <div
        className="relative w-full max-w-lg bg-elevated border border-border rounded-[20px] shadow-2xl p-6 m-4 animate-scale-in"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-border">
          <h3 className="text-base font-bold text-foreground">Create Task</h3>
          <button
            onClick={onClose}
            className="text-secondary-text hover:text-foreground rounded p-1 transition-colors cursor-pointer focus:outline-none"
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
          <div className="space-y-1.5">
            <label
              htmlFor="task-title"
              className="block text-xs font-semibold text-secondary-text uppercase tracking-wide"
            >
              Task Title
            </label>
            <input
              id="task-title"
              type="text"
              className="w-full text-sm px-3 py-2 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-all"
              placeholder="e.g. Implement authentication routing"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-destructive font-medium mt-0.5">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label
              htmlFor="task-description"
              className="block text-xs font-semibold text-secondary-text uppercase tracking-wide"
            >
              Description
            </label>
            <textarea
              id="task-description"
              className="w-full text-sm px-3 py-2 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-all min-h-[100px] resize-none leading-relaxed"
              placeholder="e.g. Detailed steps for execution..."
              {...register("description")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Priority */}
            <div className="space-y-1.5">
              <label
                htmlFor="task-priority"
                className="block text-xs font-semibold text-secondary-text uppercase tracking-wide"
              >
                Priority
              </label>
              <select
                id="task-priority"
                className="w-full text-sm px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-all cursor-pointer"
                {...register("priority")}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            {/* Assignee */}
            <div className="space-y-1.5">
              <label
                htmlFor="task-assignee"
                className="block text-xs font-semibold text-secondary-text uppercase tracking-wide"
              >
                Assignee
              </label>
              <select
                id="task-assignee"
                className="w-full text-sm px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-all cursor-pointer"
                {...register("assignee_id")}
              >
                <option value="">Unassigned</option>
                {members.map((member) => (
                  <option key={member.user_id} value={member.user_id}>
                    {member.full_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Tagged Members */}
            <div className="space-y-1.5">
              <label
                htmlFor="task-tagged-members"
                className="block text-xs font-semibold text-secondary-text uppercase tracking-wide"
              >
                Tagged Members
              </label>
              <select
                id="task-tagged-members"
                multiple
                className="w-full text-sm px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-all cursor-pointer h-[38px] overflow-hidden"
              >
                {members.map((member) => (
                  <option key={member.user_id} value={member.user_id}>
                    {member.full_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div className="space-y-1.5">
              <label
                htmlFor="task-due-date"
                className="block text-xs font-semibold text-secondary-text uppercase tracking-wide"
              >
                Due Date
              </label>
              <input
                id="task-due-date"
                type="date"
                className="w-full text-sm px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-all cursor-pointer"
                {...register("due_date")}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2.5 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-accent border border-border text-foreground hover:bg-card-hover transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-colors disabled:opacity-50 cursor-pointer"
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
