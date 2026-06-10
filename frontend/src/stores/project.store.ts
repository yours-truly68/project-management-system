import { create } from "zustand";
import { getCookie, setCookie } from "@/lib/cookies";

export { getCookie };

export interface ArchivedEntity {
  id: string;
  type: "project" | "board";
  name: string;
}

interface ProjectState {
  activeProjectId: string | null;
  setActiveProjectId: (id: string | null) => void;
  archivedEntity: ArchivedEntity | null;
  setArchivedEntity: (entity: ArchivedEntity | null) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  activeProjectId: null, // start null to prevent SSR hydration mismatch
  setActiveProjectId: (id) => {
    set({ activeProjectId: id });
    if (id) {
      setCookie("kando_active_project", id);
    } else {
      setCookie("kando_active_project", "", -1);
    }
  },
  archivedEntity: null,
  setArchivedEntity: (entity) => set({ archivedEntity: entity }),
}));

export default useProjectStore;

