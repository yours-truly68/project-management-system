import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { boardService } from "../services/board.service";
import { useProjectStore } from "@/stores/project.store";
import { useBoardStore } from "@/stores/board.store";
import { BoardUpdateInput } from "../types/board.types";

export function useBoards() {
  const { activeProjectId } = useProjectStore();
  const { activeBoardId, setActiveBoardId } = useBoardStore();

  const query = useQuery({
    queryKey: ["boards", activeProjectId],
    queryFn: () => boardService.listBoards(activeProjectId!),
    enabled: !!activeProjectId,
  });

  const boards = query.data;
  const activeBoard = boards?.find((b) => b.id === activeBoardId) || null;

  return {
    ...query,
    boards: boards || [],
    activeBoard,
    activeBoardId,
    setActiveBoardId,
  };
}


export function useBoard(id: string | null) {
  return useQuery({
    queryKey: ["board", id],
    queryFn: () => boardService.getBoard(id!),
    enabled: !!id,
  });
}

export function useCreateBoard() {
  const queryClient = useQueryClient();
  const { activeProjectId } = useProjectStore();
  const { setActiveBoardId } = useBoardStore();

  return useMutation({
    mutationFn: boardService.createBoard,
    onSuccess: (newBoard) => {
      queryClient.invalidateQueries({ queryKey: ["boards", activeProjectId] });
      setActiveBoardId(newBoard.id);
    },
  });
}

export function useUpdateBoard(boardId: string) {
  const queryClient = useQueryClient();
  const { activeProjectId } = useProjectStore();

  return useMutation({
    mutationFn: (data: BoardUpdateInput) =>
      boardService.updateBoard(boardId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards", activeProjectId] });
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
    },
  });
}

export function useDeleteBoard() {
  const queryClient = useQueryClient();
  const { activeProjectId } = useProjectStore();
  const { setActiveBoardId } = useBoardStore();

  return useMutation({
    mutationFn: boardService.deleteBoard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards", activeProjectId] });
      setActiveBoardId(null);
    },
  });
}
