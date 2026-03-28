import { useEffect, useState, useCallback } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { router } from "expo-router";
import { isFirebaseConfigured } from "@/config/firebaseEnv";
import { authService } from "@/services/shared/authService";
import { getFirebaseAuth } from "@/services/shared/firebaseApp";
import { fetchUserProfileWithRetry } from "@/services/shared/userProfileService";
import { useAuthStore } from "@/store/authStore";
import type { RegisterOrganizationInput, RegisterVolunteerInput } from "@/types/shared/auth";

export function useAuthBootstrap() {
  useEffect(() => {
    const { setUser, setHydrated, setFirebaseConfigured, setDevOrganizationBypass } =
      useAuthStore.getState();

    if (!isFirebaseConfigured()) {
      setFirebaseConfigured(false);
      setDevOrganizationBypass(false);
      setUser(null);
      setHydrated(true);
      return;
    }

    let unsub: (() => void) | undefined;
    try {
      setFirebaseConfigured(true);
      const auth = getFirebaseAuth();
      unsub = onAuthStateChanged(auth, async (firebaseUser) => {
        try {
          if (!firebaseUser) {
            if (!useAuthStore.getState().devOrganizationBypass) {
              setUser(null);
            }
          } else {
            const profile = await fetchUserProfileWithRetry(firebaseUser.uid);
            if (!profile) {
              await firebaseSignOut(auth);
              setDevOrganizationBypass(false);
              setUser(null);
            } else {
              setDevOrganizationBypass(false);
              setUser(profile);
            }
          }
        } catch {
          setDevOrganizationBypass(false);
          setUser(null);
        } finally {
          setHydrated(true);
        }
      });
    } catch {
      setFirebaseConfigured(false);
      setDevOrganizationBypass(false);
      setUser(null);
      setHydrated(true);
    }

    return () => unsub?.();
  }, []);
}

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    if (!authService.isConfigured()) {
      setError(
        "Firebase is not configured. Add EXPO_PUBLIC_FIREBASE_* variables and restart Expo.",
      );
      return;
    }
    setLoading(true);
    try {
      const profile = await authService.signIn(email, password);
      useAuthStore.getState().setDevOrganizationBypass(false);
      useAuthStore.getState().setUser(profile);
      router.replace(
        profile.role === "organization"
          ? "/organization/tabs/dashboard"
          : "/volunteer/tabs/home",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign in failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  return { login, loading, error, setError };
}

export function useRegisterVolunteer() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = useCallback(async (input: RegisterVolunteerInput) => {
    setError(null);
    if (!authService.isConfigured()) {
      setError(
        "Firebase is not configured. Add EXPO_PUBLIC_FIREBASE_* variables and restart Expo.",
      );
      return;
    }
    setLoading(true);
    try {
      const profile = await authService.registerVolunteer(input);
      useAuthStore.getState().setDevOrganizationBypass(false);
      useAuthStore.getState().setUser(profile);
      router.replace("/volunteer/tabs/home");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  return { register, loading, error, setError };
}

export function useRegisterOrganization() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = useCallback(async (input: RegisterOrganizationInput) => {
    setError(null);
    if (!authService.isConfigured()) {
      setError(
        "Firebase is not configured. Add EXPO_PUBLIC_FIREBASE_* variables and restart Expo.",
      );
      return;
    }
    setLoading(true);
    try {
      const profile = await authService.registerOrganization(input);
      useAuthStore.getState().setDevOrganizationBypass(false);
      useAuthStore.getState().setUser(profile);
      router.replace("/organization/tabs/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  return { register, loading, error, setError };
}
