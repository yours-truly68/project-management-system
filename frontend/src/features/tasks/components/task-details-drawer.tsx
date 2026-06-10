"use client";

import * as React from "react";
import { X, Trash2, Loader2, AlertTriangle, Calendar, User, Info, Tag } from "lucide-react";
import { Task, TaskPriority } from "../types/task.types";
import {
  useUpdateTask,
  useDeleteTask,
  useAssignTask,
} from "../hooks/use-tasks";
import { WorkspaceMemberDetailed } from "@/features/workspaces/types/workspace.types";
import { getErrorMessage } from "@/lib/utils";


interface TaskDetailsDrawerProps {
  task: Task;
  boardId: string;
  isOpen: boolean;
  onClose: () => void;
  members: WorkspaceMemberDetailed[];
}

export function TaskDetailsDrawer({
  task,
  boardId,
  isOpen,
  onClose,
  members,
}: TaskDetailsDrawerProps) {
  const { mutateAsync: updateTask, isPending: isUpdating } = useUpdateTask(task.id, boardId);
  const { mutateAsync: assignTask, isPending: isAssigning } = useAssignTask(task.id, boardId);
  const { mutateAsync: deleteTask, isPending: isDeleting } = useDeleteTask(boardId);

  const [title, setTitle] = React.useState(task.title);
  const [description, setDescription] = React.useState(task.description || "");
  const [priority, setPriority] = React.useState<TaskPriority>(task.priority);
  const [dueDate, setDueDate] = React.useState(
    task.due_date ? new Date(task.due_date).toISOString().split("T")[0] : ""
  );
  const [assigneeId, setAssigneeId] = React.useState(task.assignee_id || "");

  const [errorMsg, setErrorMsg] = React.useState("");
  const [showConfirmDelete, setShowConfirmDelete] = React.useState(false);

  // Sync state variables with incoming task prop asynchronously
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setTitle(task.title);
      setDescription(task.description || "");
      setPriority(task.priority);
      setDueDate(
        task.due_date ? new Date(task.due_date).toISOString().split("T")[0] : ""
      );
      setAssigneeId(task.assignee_id || "");
      setErrorMsg("");
      setShowConfirmDelete(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [task]);

  if (!isOpen) return null;

  const handleUpdateField = async (fields: Partial<Task>) => {
    setErrorMsg("");
    try {
      await updateTask(fields);
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
    }
  };

  const handleAssigneeChange = async (val: string) => {
    const targetId = val === "" ? null : val;
    setAssigneeId(val);
    setErrorMsg("");
    try {
      await assignTask(targetId);
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
    }
  };

  const handleDeleteTask = async () => {
    setErrorMsg("");
    try {
      await deleteTask(task.id);
      onClose();
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/75 backdrop-blur-[2px] transition-opacity select-none"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div
        className="fixed top-0 right-0 h-full w-full sm:w-[460px] bg-elevated border-l border-border shadow-2xl z-50 transform translate-x-0 transition-transform duration-300 flex flex-col justify-between select-none"
        role="dialog"
        aria-modal="true"
        aria-label="Task details panel"
      >
        {/* Header toolbar */}
        <div className="flex items-center justify-between px-5 h-14 border-b border-border bg-elevated shrink-0">
          <div className="flex items-center gap-2">
            {!showConfirmDelete ? (
              <button
                onClick={() => setShowConfirmDelete(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-rose-500 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 text-xs font-semibold transition-all cursor-pointer focus:outline-none"
                title="Delete Task"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Task</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 animate-fade-in">
                <button
                  onClick={handleDeleteTask}
                  disabled={isDeleting}
                  className="flex items-center gap-1 px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-bold rounded-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <AlertTriangle className="w-3 h-3" />
                  )}
                  Confirm Delete
                </button>
                <button
                  onClick={() => setShowConfirmDelete(false)}
                  disabled={isDeleting}
                  className="px-3 py-1.5 border border-border text-foreground hover:bg-secondary text-[11px] font-semibold rounded-lg transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition-all cursor-pointer focus:outline-none"
            aria-label="Close drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {errorMsg && (
            <div className="p-2.5 rounded border border-destructive/20 bg-destructive/10 text-destructive text-xs font-semibold leading-normal animate-fade-in">
              {errorMsg}
            </div>
          )}

          {/* Title input (auto-saves on blur) */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider font-sans">
              Task Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => {
                if (title.trim() && title.trim() !== task.title) {
                  handleUpdateField({ title: title.trim() });
                } else {
                  setTitle(task.title); // revert on empty
                }
              }}
              className="w-full text-sm font-bold px-2.5 py-1.5 bg-transparent border border-border/40 hover:border-border focus:border-ring focus:bg-secondary/20 rounded-lg text-foreground placeholder-muted-foreground/50 focus:outline-none transition-all duration-150"
              placeholder="Task title..."
            />
          </div>

          {/* Details layout side-by-side */}
          <div className="space-y-4 bg-secondary/15 rounded-xl border border-border p-4.5">
            <h4 className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider flex items-center gap-1.5 border-b border-border/40 pb-2 mb-2">
              <Info className="w-3.5 h-3.5 text-muted-foreground/40" />
              Properties
            </h4>

            {/* Priority option */}
            <div className="grid grid-cols-3 items-center gap-2">
              <label
                htmlFor="drawer-priority"
                className="text-[11px] font-semibold text-muted-foreground/85 flex items-center gap-1.5"
              >
                <Tag className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                Priority
              </label>
              <div className="col-span-2">
                <select
                  id="drawer-priority"
                  value={priority}
                  onChange={(e) => {
                    const val = e.target.value as TaskPriority;
                    setPriority(val);
                    handleUpdateField({ priority: val });
                  }}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-background border border-border text-foreground hover:border-border-hover focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-all cursor-pointer font-medium"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>

            {/* Assignee options */}
            <div className="grid grid-cols-3 items-center gap-2">
              <label
                htmlFor="drawer-assignee"
                className="text-[11px] font-semibold text-muted-foreground/85 flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                Assignee
              </label>
              <div className="col-span-2">
                <select
                  id="drawer-assignee"
                  value={assigneeId}
                  onChange={(e) => handleAssigneeChange(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-background border border-border text-foreground hover:border-border-hover focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-all cursor-pointer font-medium"
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

            {/* Due Date option */}
            <div className="grid grid-cols-3 items-center gap-2">
              <label
                htmlFor="drawer-duedate"
                className="text-[11px] font-semibold text-muted-foreground/85 flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                Due Date
              </label>
              <div className="col-span-2">
                <input
                  id="drawer-duedate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDueDate(val);
                    handleUpdateField({
                      due_date: val === "" ? null : new Date(val).toISOString(),
                    });
                  }}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-background border border-border text-foreground hover:border-border-hover focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-all cursor-pointer font-medium"
                />
              </div>
            </div>
          </div>

          {/* Description textbox (auto-saves on blur) */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider font-sans">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => {
                if (description !== (task.description || "")) {
                  handleUpdateField({ description: description === "" ? null : description });
                }
              }}
              placeholder="Add details for this task..."
              className="w-full text-xs px-3 py-2 bg-background border border-border focus:border-ring rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-all min-h-[160px] resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Footer info indicator */}
        <div className="px-5 py-3.5 bg-secondary/25 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground/80 shrink-0 font-sans">
          <span>Created: {new Date(task.created_at).toLocaleString()}</span>
          {(isUpdating || isAssigning) && (
            <span className="flex items-center gap-1 font-semibold text-primary animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" />
              Saving...
            </span>
          )}
        </div>
      </div>
    </>
  );
}

export default TaskDetailsDrawer;
