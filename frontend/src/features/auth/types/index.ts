export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string;
  auth_provider?: string;
  avatar_url: string | null;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
}

export interface AuthenticatedUserResponse {
  tokens: TokenResponse;
  user: User;
}
