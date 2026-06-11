import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taskService } from "../services/task.service";
import {
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

export function useMoveTask(taskId: string, boardId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TaskMoveInput) => taskService.moveTask(taskId, data),
    onSuccess: () => {
      if (boardId) {
        queryClient.invalidateQueries({ queryKey: ["tasks", boardId] });
        queryClient.invalidateQueries({ queryKey: ["activities"] });
      }
    },
  });
}
