import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { columnService } from "../services/column.service";
import {
  Column,
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
    onMutate: async (newOrder) => {
      if (!boardId) return;

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["columns", boardId] });

      // Snapshot the previous columns
      const previousColumns = queryClient.getQueryData<Column[]>(["columns", boardId]) || [];

      // Create a map of IDs to indexes
      const idToIndex = new Map(newOrder.ordered_ids.map((id, index) => [id, index]));

      // Optimistically update positions of columns and sort them locally
      const reordered = previousColumns
        .map((col) => {
          const newIndex = idToIndex.get(col.id);
          if (newIndex !== undefined) {
            return { ...col, position: newIndex };
          }
          return col;
        })
        .sort((a, b) => a.position - b.position);

      queryClient.setQueryData<Column[]>(["columns", boardId], reordered);

      return { previousColumns };
    },
    onError: (err, newOrder, context) => {
      if (context?.previousColumns && boardId) {
        queryClient.setQueryData(["columns", boardId], context.previousColumns);
      }
    },
    onSettled: () => {
      if (boardId) {
        queryClient.invalidateQueries({ queryKey: ["columns", boardId] });
      }
    },
  });
}
