import { apiClient } from "@/lib/api/client";
import { Board, BoardCreateInput, BoardUpdateInput } from "../types/board.types";

export const boardService = {
  async listBoards(projectId: string): Promise<Board[]> {
    const response = await apiClient.get<Board[]>("/boards/", {
      params: { project_id: projectId },
    });
    return response.data;
  },

  async getBoard(id: string): Promise<Board> {
    const response = await apiClient.get<Board>(`/boards/${id}`);
    return response.data;
  },

  async createBoard(data: BoardCreateInput): Promise<Board> {
    const response = await apiClient.post<Board>("/boards/", data);
    return response.data;
  },

  async updateBoard(id: string, data: BoardUpdateInput): Promise<Board> {
    const response = await apiClient.patch<Board>(`/boards/${id}`, data);
    return response.data;
  },

  async deleteBoard(id: string): Promise<void> {
    await apiClient.delete(`/boards/${id}`);
  },

  async getBoardPreference(boardId: string): Promise<{ view_type: string }> {
    const response = await apiClient.get<{ view_type: string }>(`/boards/${boardId}/preference`);
    return response.data;
  },

  async updateBoardPreference(boardId: string, viewType: string): Promise<{ view_type: string }> {
    const response = await apiClient.put<{ view_type: string }>(`/boards/${boardId}/preference`, {
      view_type: viewType,
    });
    return response.data;
  },
};

export default boardService;
