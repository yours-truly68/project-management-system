"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Loader2, Check } from "lucide-react";
import { useUpdateColumn } from "../hooks/use-columns";
import { Column } from "../types/column.types";
import { getErrorMessage } from "@/lib/utils";

const editColumnSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name cannot exceed 50 characters"),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color").optional(),
});

type EditColumnFormData = z.infer<typeof editColumnSchema>;

interface EditColumnModalProps {
  column: Column;
  boardId: string;
  isOpen: boolean;
  onClose: () => void;
}

const PALETTE = [
  { name: "Blue", hex: "#3b82f6" },
  { name: "Emerald", hex: "#10b981" },
  { name: "Amber", hex: "#f59e0b" },
  { name: "Rose", hex: "#f43f5e" },
  { name: "Indigo", hex: "#6366f1" },
  { name: "Violet", hex: "#8b5cf6" },
  { name: "Teal", hex: "#14b8a6" },
  { name: "Orange", hex: "#f97316" },
];

export function EditColumnModal({ column, boardId, isOpen, onClose }: EditColumnModalProps) {
  const { mutateAsync: updateColumn, isPending, error } = useUpdateColumn(column.id, boardId);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EditColumnFormData>({
    resolver: zodResolver(editColumnSchema),
    defaultValues: {
      name: column.name,
      color: column.color || PALETTE[0].hex,
    },
  });

  const selectedColor = watch("color") || PALETTE[0].hex;

  React.useEffect(() => {
    if (isOpen) {
      reset({
        name: column.name,
        color: column.color || PALETTE[0].hex,
      });
    }
  }, [isOpen, column, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data: EditColumnFormData) => {
    try {
      await updateColumn({
        name: data.name,
        color: selectedColor,
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
          <h3 className="text-sm font-semibold text-foreground">Edit Column</h3>
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
              Column Name
            </label>
            <input
              id="name"
              type="text"
              className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-all"
              placeholder="e.g. In Progress"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-[10px] text-destructive font-medium mt-0.5">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
              Theme Color
            </label>
            <div className="flex flex-wrap gap-2.5">
              {PALETTE.map((color) => {
                const isSelected = selectedColor === color.hex;
                return (
                  <button
                    key={color.hex}
                    type="button"
                    onClick={() => setValue("color", color.hex)}
                    style={{ backgroundColor: color.hex }}
                    className="w-6.5 h-6.5 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center transition-all scale-100 hover:scale-105 active:scale-95 cursor-pointer relative"
                    title={color.name}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />}
                  </button>
                );
              })}
            </div>
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
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditColumnModal;
