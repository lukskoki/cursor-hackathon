import { useEffect, useState } from "react";
import { volunteerBadgeService } from "@/services/volunteer/badges/volunteerBadgeService";
import { useAuthStore } from "@/store/authStore";
import type { Badge } from "@/types/volunteer/badge";

export function useVolunteerBadges() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const user = useAuthStore((s) => s.user);
  const uid = user?.role === "volunteer" ? user.id : null;

  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!hydrated) {
      setLoading(true);
      return;
    }

    if (!uid) {
      setBadges([]);
      setLoading(false);
      setError(user ? "Badges are for volunteers only." : "Not signed in.");
      return;
    }

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await volunteerBadgeService.getBadges(uid);
        if (!cancelled) setBadges(data);
      } catch (e) {
        if (!cancelled) {
          setBadges([]);
          setError(e instanceof Error ? e.message : "Failed to load badges");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hydrated, uid, user]);

  return { badges, loading, error };
}
