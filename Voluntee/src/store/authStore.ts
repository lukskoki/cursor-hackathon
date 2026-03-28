import { create } from "zustand";

export type UserRole = "volunteer" | "organization";

type AuthState = {
  isLoggedIn: boolean;
  role: UserRole | null;
  email: string | null;
  signIn: (email: string, role: UserRole) => void;
  signOut: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  role: null,
  email: null,
  signIn: (email, role) => set({ isLoggedIn: true, email, role }),
  signOut: () => set({ isLoggedIn: false, email: null, role: null }),
}));
