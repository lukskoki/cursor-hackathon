import { useEffect, useState } from "react";
import { volunteerProfileService } from "@/services/volunteer/profile/volunteerProfileService";
import { useAuthStore } from "@/store/authStore";
import type { VolunteerProfileDetail } from "@/types/volunteer/profile";

/**
 * Učitava profil volontera iz Firestorea; ponavlja učitavanje kad se promijeni prijavljeni korisnik.
 */
export function useVolunteerProfile() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const user = useAuthStore((s) => s.user);
  const uid = user?.role === "volunteer" ? user.id : null;

  const [profile, setProfile] = useState<VolunteerProfileDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!hydrated) {
      setLoading(true);
      return;
    }

    if (!uid) {
      setProfile(null);
      setError(
        user
          ? "This screen is for volunteers only."
          : "Not signed in.",
      );
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await volunteerProfileService.getProfile();
        if (!cancelled) setProfile(data);
      } catch (e) {
        if (!cancelled) {
          setProfile(null);
          setError(e instanceof Error ? e.message : "Failed to load profile");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hydrated, uid, user]);

  return { profile, loading, error };
}
