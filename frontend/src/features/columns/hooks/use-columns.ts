import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { columnService } from "../services/column.service";
import {
  ColumnUpdateInput,
  ColumnReorderInput,
} from "../types/column.types";

export function useColumns(boardId: string | null) {
  return useQuery({
    queryKey: ["columns", boardId],
    queryFn: () => (boardId ? columnService.listColumns(boardId) : Promise.resolve([])),
    enabled: !!boardId,
  });
}

export function useCreateColumn(boardId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: columnService.createColumn,
    onSuccess: () => {
      if (boardId) {
        queryClient.invalidateQueries({ queryKey: ["columns", boardId] });
      }
    },
  });
}

export function useUpdateColumn(columnId: string, boardId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ColumnUpdateInput) => columnService.updateColumn(columnId, data),
    onSuccess: () => {
      if (boardId) {
        queryClient.invalidateQueries({ queryKey: ["columns", boardId] });
      }
    },
  });
}

export function useDeleteColumn(boardId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: columnService.deleteColumn,
    onSuccess: () => {
      if (boardId) {
        queryClient.invalidateQueries({ queryKey: ["columns", boardId] });
      }
    },
  });
}

export function useReorderColumns(boardId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ColumnReorderInput) =>
      boardId
        ? columnService.reorderColumns(boardId, data)
        : Promise.reject("No active board selected"),
    onSuccess: () => {
      if (boardId) {
        queryClient.invalidateQueries({ queryKey: ["columns", boardId] });
      }
    },
  });
}
