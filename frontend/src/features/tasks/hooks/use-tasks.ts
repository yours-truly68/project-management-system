import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taskService } from "../services/task.service";
import {
  Task,
  TaskUpdateInput,
  TaskMoveInput,
} from "../types/task.types";

export function useTasks(boardId: string | null) {
  return useQuery({
    queryKey: ["tasks", boardId],
    queryFn: () => (boardId ? taskService.listTasks(boardId) : Promise.resolve([])),
    enabled: !!boardId,
  });
}

export function useCreateTask(boardId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: taskService.createTask,
    onSuccess: () => {
      if (boardId) {
        queryClient.invalidateQueries({ queryKey: ["tasks", boardId] });
        queryClient.invalidateQueries({ queryKey: ["activities"] });
      }
    },
  });
}

export function useUpdateTask(taskId: string, boardId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TaskUpdateInput) => taskService.updateTask(taskId, data),
    onSuccess: () => {
      if (boardId) {
        queryClient.invalidateQueries({ queryKey: ["tasks", boardId] });
        queryClient.invalidateQueries({ queryKey: ["activities"] });
      }
    },
  });
}

export function useDeleteTask(boardId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: taskService.deleteTask,
    onSuccess: () => {
      if (boardId) {
        queryClient.invalidateQueries({ queryKey: ["tasks", boardId] });
        queryClient.invalidateQueries({ queryKey: ["activities"] });
      }
    },
  });
}

export function useAssignTask(taskId: string, boardId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assigneeId: string | null) => taskService.assignTask(taskId, assigneeId),
    onSuccess: () => {
      if (boardId) {
        queryClient.invalidateQueries({ queryKey: ["tasks", boardId] });
        queryClient.invalidateQueries({ queryKey: ["activities"] });
      }
    },
  });
}

export function useMoveTask(boardId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, column_id, position }: { taskId: string } & TaskMoveInput) =>
      taskService.moveTask(taskId, { column_id, position }),
    onMutate: async ({ taskId, column_id, position }) => {
      if (!boardId) return;

      // Cancel outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ["tasks", boardId] });

      // Snapshot the previous tasks
      const previousTasks = queryClient.getQueryData<Task[]>(["tasks", boardId]) || [];

      // Find the task being moved
      const movedTask = previousTasks.find((t) => t.id === taskId);
      if (!movedTask) return { previousTasks };

      const sourceColumnId = movedTask.column_id;
      const targetColumnId = column_id;

      // Separate other columns' tasks
      const otherTasks = previousTasks.filter(
        (t) => t.id !== taskId && t.column_id !== sourceColumnId && t.column_id !== targetColumnId
      );

      // Sort tasks in source and target columns by position
      const sourceTasks = previousTasks
        .filter((t) => t.column_id === sourceColumnId && t.id !== taskId)
        .sort((a, b) => a.position - b.position);

      const targetTasks = previousTasks
        .filter((t) => t.column_id === targetColumnId)
        .sort((a, b) => a.position - b.position);

      const optimisticMovedTask = {
        ...movedTask,
        column_id: targetColumnId,
      };

      // Insert moved task into targetTasks at specified index
      const updatedTargetTasks = [...targetTasks];
      const targetIndex = Math.max(0, Math.min(position, updatedTargetTasks.length));
      updatedTargetTasks.splice(targetIndex, 0, optimisticMovedTask);

      // Re-index both source and target column positions
      const reindexedSource = sourceTasks.map((t, idx) => ({ ...t, position: idx }));
      const reindexedTarget = updatedTargetTasks.map((t, idx) => ({ ...t, position: idx }));

      const finalTasks = [...otherTasks, ...reindexedSource, ...reindexedTarget];

      queryClient.setQueryData<Task[]>(["tasks", boardId], finalTasks);

      return { previousTasks };
    },
    onError: (err, moveInput, context) => {
      if (context?.previousTasks && boardId) {
        queryClient.setQueryData(["tasks", boardId], context.previousTasks);
      }
    },
    onSettled: () => {
      if (boardId) {
        queryClient.invalidateQueries({ queryKey: ["tasks", boardId] });
        queryClient.invalidateQueries({ queryKey: ["activities"] });
      }
    },
  });
}

export function useReorderTasks(boardId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ columnId, orderedIds }: { columnId: string; orderedIds: string[] }) =>
      taskService.reorderTasks(columnId, orderedIds),
    onMutate: async ({ columnId, orderedIds }) => {
      if (!boardId) return;

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["tasks", boardId] });

      // Snapshot the previous tasks
      const previousTasks = queryClient.getQueryData<Task[]>(["tasks", boardId]) || [];

      // Create a map of task ID to index position
      const positionMap = new Map(orderedIds.map((id, index) => [id, index]));

      // Optimistically update positions of tasks inside that column
      const updatedTasks = previousTasks.map((task) => {
        if (task.column_id === columnId) {
          const newPos = positionMap.get(task.id);
          if (newPos !== undefined) {
            return { ...task, position: newPos };
          }
        }
        return task;
      });

      queryClient.setQueryData<Task[]>(["tasks", boardId], updatedTasks);

      return { previousTasks };
    },
    onError: (err, variables, context) => {
      if (context?.previousTasks && boardId) {
        queryClient.setQueryData(["tasks", boardId], context.previousTasks);
      }
    },
    onSettled: () => {
      if (boardId) {
        queryClient.invalidateQueries({ queryKey: ["tasks", boardId] });
      }
    },
  });
}
