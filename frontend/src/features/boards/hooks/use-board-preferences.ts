import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { boardService } from "../services/board.service";

export function useBoardPreference(boardId: string | null) {
  return useQuery({
    queryKey: ["board-preference", boardId],
    queryFn: () => (boardId ? boardService.getBoardPreference(boardId) : Promise.resolve({ view_type: "board" })),
    enabled: !!boardId,
  });
}

export function useUpdateBoardPreference(boardId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (viewType: string) => {
      if (!boardId) return Promise.reject("No board selected");
      return boardService.updateBoardPreference(boardId, viewType);
    },
    onMutate: async (newViewType) => {
      if (!boardId) return;

      await queryClient.cancelQueries({ queryKey: ["board-preference", boardId] });

      const previousPreference = queryClient.getQueryData<{ view_type: string }>([
        "board-preference",
        boardId,
      ]);

      // Optimistically set the preference in cache
      queryClient.setQueryData<{ view_type: string }>(
        ["board-preference", boardId],
        { view_type: newViewType }
      );

      return { previousPreference };
    },
    onError: (err, newViewType, context) => {
      if (boardId && context?.previousPreference) {
        queryClient.setQueryData(
          ["board-preference", boardId],
          context.previousPreference
        );
      }
    },
    onSettled: () => {
      if (boardId) {
        queryClient.invalidateQueries({ queryKey: ["board-preference", boardId] });
      }
    },
  });
}
