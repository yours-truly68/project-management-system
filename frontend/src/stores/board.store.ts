import { create } from "zustand";
import { getCookie, setCookie } from "@/lib/cookies";

export { getCookie };

interface BoardState {
  activeBoardId: string | null;
  setActiveBoardId: (id: string | null) => void;
}

export const useBoardStore = create<BoardState>((set) => ({
  activeBoardId: null, // start null to prevent SSR hydration mismatch
  setActiveBoardId: (id) => {
    set({ activeBoardId: id });
    if (id) {
      setCookie("kando_active_board", id);
    } else {
      setCookie("kando_active_board", "", -1);
    }
  },
}));

export default useBoardStore;
