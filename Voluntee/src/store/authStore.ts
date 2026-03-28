import { create } from "zustand";
import { authService } from "@/services/shared/authService";
import type { UserRole } from "@/types/shared/user";

export type { UserRole };

type AuthState = {
  /** True nakon prvog onAuthStateChanged (ili odmah ako nema Firebasea). */
  authInitialized: boolean;
  isLoggedIn: boolean;
  role: UserRole | null;
  email: string | null;
  uid: string | null;
  setSession: (s: {
    isLoggedIn: boolean;
    email: string | null;
    uid: string | null;
    role: UserRole | null;
  }) => void;
  setAuthInitialized: (v: boolean) => void;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  authInitialized: false,
  isLoggedIn: false,
  role: null,
  email: null,
  uid: null,
  setSession: (s) => set(s),
  setAuthInitialized: (v) => set({ authInitialized: v }),
  signOut: async () => {
    await authService.signOut();
  },
}));
