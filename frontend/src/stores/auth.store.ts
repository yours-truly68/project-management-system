import { create } from "zustand";

export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  avatarUrl: string | null;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
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
