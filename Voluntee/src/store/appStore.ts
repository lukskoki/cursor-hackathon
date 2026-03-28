import { create } from "zustand";

type AppState = {
  hydrated: boolean;
  setHydrated: (v: boolean) => void;
};

export const useAppStore = create<AppState>((set) => ({
  hydrated: false,
  setHydrated: (hydrated) => set({ hydrated }),
}));
