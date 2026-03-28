import { create } from "zustand";
import { isFirebaseConfigured } from "@/config/firebaseEnv";
import type { UserProfile } from "@/types/shared/user";

export type { UserRole } from "@/types/shared/user";

type AuthState = {
  hydrated: boolean;
  firebaseConfigured: boolean;
  /** When true, Firebase `onAuthStateChanged(null)` must not clear the in-memory dev org user. */
  devOrganizationBypass: boolean;
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  setHydrated: (hydrated: boolean) => void;
  setFirebaseConfigured: (configured: boolean) => void;
  setDevOrganizationBypass: (active: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  hydrated: false,
  firebaseConfigured: isFirebaseConfigured(),
  devOrganizationBypass: false,
  user: null,
  setUser: (user) => set({ user }),
  setHydrated: (hydrated) => set({ hydrated }),
  setFirebaseConfigured: (firebaseConfigured) => set({ firebaseConfigured }),
  setDevOrganizationBypass: (devOrganizationBypass) => set({ devOrganizationBypass }),
}));
