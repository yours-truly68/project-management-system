import { apiClient } from "@/lib/api/client";
import { Favorite, FavoriteCreateInput } from "../types/favorite.types";

export const favoriteService = {
  async listFavorites(): Promise<Favorite[]> {
    const response = await apiClient.get<Favorite[]>("/favorites/");
    return response.data;
  },

  async createFavorite(data: FavoriteCreateInput): Promise<Favorite> {
    const response = await apiClient.post<Favorite>("/favorites/", data);
    return response.data;
  },

  async deleteFavorite(id: string): Promise<void> {
    await apiClient.delete(`/favorites/${id}`);
  },
};

export default favoriteService;
