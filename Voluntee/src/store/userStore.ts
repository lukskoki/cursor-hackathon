import { create } from "zustand";
import type { User } from "@/types/shared/user";

type UserState = {
  user: User | null;
  setUser: (u: User | null) => void;
};

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
