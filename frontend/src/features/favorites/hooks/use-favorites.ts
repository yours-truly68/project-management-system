import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { favoriteService } from "../services/favorite.service";
import { Favorite, FavoriteCreateInput } from "../types/favorite.types";
import { Project } from "@/features/projects/types/project.types";
import { Board } from "@/features/boards/types/board.types";

export function useFavorites() {
  return useQuery<Favorite[]>({
    queryKey: ["favorites"],
    queryFn: favoriteService.listFavorites,
    staleTime: 30000, // 30s stale time is reasonable for sidebar/cards
  });
}

export function useCreateFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: favoriteService.createFavorite,
    onMutate: async (newFavInput: FavoriteCreateInput) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["favorites"] });

      // Snapshot the previous value
      const previousFavorites = queryClient.getQueryData<Favorite[]>(["favorites"]) || [];

      // Try to resolve project or board detail from cache for the optimistic item
      let resolvedProject = undefined;
      let resolvedBoard = undefined;

      if (newFavInput.entity_type === "project") {
        // Look up in projects list or single project cache
        const projectsCache = queryClient.getQueryData<Project[]>(["projects"]) || [];
        resolvedProject = projectsCache.find((p) => p.id === newFavInput.entity_id);
      } else if (newFavInput.entity_type === "board") {
        const boardsCache = queryClient.getQueryData<Board[]>(["boards"]) || [];
        resolvedBoard = boardsCache.find((b) => b.id === newFavInput.entity_id);
      }

      const optimisticFavorite: Favorite = {
        id: `optimistic-${Date.now()}`,
        user_id: "",
        entity_type: newFavInput.entity_type,
        entity_id: newFavInput.entity_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        project: resolvedProject,
        board: resolvedBoard,
      };

      // Optimistically update to the new value
      queryClient.setQueryData<Favorite[]>(
        ["favorites"],
        [optimisticFavorite, ...previousFavorites]
      );

      // Return context with snapshotted value
      return { previousFavorites };
    },
    onError: (err, newFav, context) => {
      if (context?.previousFavorites) {
        queryClient.setQueryData(["favorites"], context.previousFavorites);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
}

export function useDeleteFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: favoriteService.deleteFavorite,
    onMutate: async (favIdToDelete) => {
      await queryClient.cancelQueries({ queryKey: ["favorites"] });

      const previousFavorites = queryClient.getQueryData<Favorite[]>(["favorites"]) || [];

      // Optimistically remove the favorite from cache
      queryClient.setQueryData<Favorite[]>(
        ["favorites"],
        previousFavorites.filter((fav) => fav.id !== favIdToDelete)
      );

      return { previousFavorites };
    },
    onError: (err, favId, context) => {
      if (context?.previousFavorites) {
        queryClient.setQueryData(["favorites"], context.previousFavorites);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
}
