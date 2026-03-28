import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "@/services/shared/firebase";
import { authService } from "@/services/shared/authService";
import { useAuthStore } from "@/store/authStore";

/**
 * Drži Zustand u skladu s Firebase Auth + ulogom iz Firestorea (users/{uid}).
 */
export function AuthSync() {
  useEffect(() => {
    if (!isFirebaseConfigured()) {
      useAuthStore.getState().setAuthInitialized(true);
      return;
    }

    const auth = getFirebaseAuth();
    const unsub = onAuthStateChanged(auth, async (user) => {
      const { setSession, setAuthInitialized } = useAuthStore.getState();
      try {
        if (!user) {
          setSession({
            isLoggedIn: false,
            email: null,
            uid: null,
            role: null,
          });
          return;
        }
        const email = user.email ?? "";
        let role = await authService.getUserRole(user.uid);
        if (role === null) {
          role = await authService.ensureUserProfile(user.uid, email, "volunteer");
        }
        setSession({
          isLoggedIn: true,
          email,
          uid: user.uid,
          role,
        });
      } catch (e) {
        console.warn("[AuthSync]", e);
        setSession({
          isLoggedIn: false,
          email: null,
          uid: null,
          role: null,
        });
      } finally {
        setAuthInitialized(true);
      }
    });

    return unsub;
  }, []);

  return null;
}
