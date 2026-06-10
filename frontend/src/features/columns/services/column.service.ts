import { apiClient } from "@/lib/api/client";
import {
  Column,
  ColumnCreateInput,
  ColumnUpdateInput,
  ColumnReorderInput,
} from "../types/column.types";

export const columnService = {
  async listColumns(boardId: string): Promise<Column[]> {
    const response = await apiClient.get<Column[]>("/columns/", {
      params: { board_id: boardId },
    });
    return response.data;
  },

  async createColumn(data: ColumnCreateInput): Promise<Column> {
    const response = await apiClient.post<Column>("/columns/", data);
    return response.data;
  },

  async updateColumn(id: string, data: ColumnUpdateInput): Promise<Column> {
    const response = await apiClient.patch<Column>(`/columns/${id}`, data);
    return response.data;
  },

  async deleteColumn(id: string): Promise<void> {
    await apiClient.delete(`/columns/${id}`);
  },

  async reorderColumns(boardId: string, data: ColumnReorderInput): Promise<void> {
    await apiClient.post("/columns/reorder", data, {
      params: { board_id: boardId },
    });
  },
};

export default columnService;
