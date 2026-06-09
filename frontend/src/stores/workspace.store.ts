import { create } from "zustand";
import { getCookie, setCookie } from "@/lib/cookies";

export { getCookie };

interface WorkspaceState {
  activeWorkspaceId: string | null;
  setActiveWorkspaceId: (id: string | null) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  activeWorkspaceId: null, // start null to prevent SSR hydration mismatch
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
