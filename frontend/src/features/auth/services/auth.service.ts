import { apiClient } from "@/lib/api/client";
import { User } from "@/stores/auth.store";

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export const authService = {
  async register(data: Record<string, string>): Promise<TokenResponse> {
    const response = await apiClient.post<TokenResponse>("/auth/register", data);
    return response.data;
  },

  async login(data: Record<string, string>): Promise<TokenResponse> {
    const response = await apiClient.post<TokenResponse>("/auth/login", data);
    return response.data;
  },

  async refresh(): Promise<TokenResponse> {
    // Refresh token is read and rotated on the backend via HttpOnly cookies
    const response = await apiClient.post<TokenResponse>("/auth/refresh");
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
