import { apiClient } from "@/lib/api/client";
import {
  Task,
  TaskCreateInput,
  TaskUpdateInput,
  TaskMoveInput,
} from "../types/task.types";

export const taskService = {
  async listTasks(boardId: string): Promise<Task[]> {
    const response = await apiClient.get<Task[]>("/tasks/", {
      params: { board_id: boardId },
    });
    return response.data;
  },

  async createTask(data: TaskCreateInput): Promise<Task> {
    const response = await apiClient.post<Task>("/tasks/", data);
    return response.data;
  },

  async updateTask(id: string, data: TaskUpdateInput): Promise<Task> {
    const response = await apiClient.patch<Task>(`/tasks/${id}`, data);
    return response.data;
  },

  async deleteTask(id: string): Promise<void> {
    await apiClient.delete(`/tasks/${id}`);
  },

  async assignTask(id: string, assigneeId: string | null): Promise<Task> {
    const response = await apiClient.post<Task>(`/tasks/${id}/assign`, {
      assignee_id: assigneeId,
    });
    return response.data;
  },

  async moveTask(id: string, data: TaskMoveInput): Promise<Task> {
    const response = await apiClient.post<Task>(`/tasks/${id}/move`, data);
    return response.data;
  },

  async reorderTasks(
    columnId: string,
    orderedIds: string[]
  ): Promise<void> {
    await apiClient.post(
      "/tasks/reorder",
      { column_id: columnId, ordered_ids: orderedIds },
      { params: { column_id: columnId } }
    );
  },
};

export default taskService;
