import { apiClient } from "@/lib/api/client";
import { User } from "@/stores/auth.store";
import { AuthenticatedUserResponse, TokenResponse } from "../types";

export const authService = {
  async register(data: Record<string, string>): Promise<AuthenticatedUserResponse> {
    const response = await apiClient.post<AuthenticatedUserResponse>("/auth/register", data);
    return response.data;
  },

  async login(data: Record<string, string>): Promise<AuthenticatedUserResponse> {
    const response = await apiClient.post<AuthenticatedUserResponse>("/auth/login", data);
    return response.data;
  },

  async refresh(refreshToken?: string): Promise<TokenResponse> {
    const response = await apiClient.post<TokenResponse>("/auth/refresh", {
      ...(refreshToken ? { refresh_token: refreshToken } : {}),
    });
    return response.data;
  },

  async logout(): Promise<void> {
    await apiClient.post("/auth/logout");
  },

  async getMe(): Promise<User> {
    const response = await apiClient.get<User>("/auth/me");
    return response.data;
  },
};
export default authService;
