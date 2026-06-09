import { create } from "zustand";

interface WorkspaceState {
  activeWorkspaceId: string | null;
  setActiveWorkspaceId: (id: string | null) => void;
}

const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};

const setCookie = (name: string, value: string, days = 7) => {
  if (typeof document === "undefined") return;
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `; expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value || ""}${expires}; path=/; SameSite=Lax`;
};

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  activeWorkspaceId: getCookie("kando_active_workspace"),
  setActiveWorkspaceId: (id) => {
    set({ activeWorkspaceId: id });
    if (id) {
      setCookie("kando_active_workspace", id);
    } else {
      setCookie("kando_active_workspace", "", -1);
    }
  },
}));

export default useWorkspaceStore;
