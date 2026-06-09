import { create } from "zustand";

export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isRestoringSession: boolean;
  setAuth: (user: User) => void;
  clearAuth: () => void;
  setRestoringSession: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isRestoringSession: true, // starts loading-first
  setAuth: (user) => set({ user, isAuthenticated: true }),
  clearAuth: () => set({ user: null, isAuthenticated: false }),
  setRestoringSession: (loading) => set({ isRestoringSession: loading }),
}));
export default useAuthStore;
