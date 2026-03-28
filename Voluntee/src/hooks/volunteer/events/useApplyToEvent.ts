import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { volunteerApplicationsService } from "@/services/volunteer/events/volunteerApplicationsService";

export function useApplyToEvent(eventId: string | undefined) {
  const user = useAuthStore((s) => s.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!eventId || !user) {
      setChecking(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const already = await volunteerApplicationsService.hasApplied(eventId, user.id);
        if (!cancelled) setApplied(already);
      } catch {
        /* swallow – best-effort check */
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [eventId, user]);

  const apply = useCallback(async () => {
    if (!eventId || !user) return;
    setLoading(true);
    setError(null);
    try {
      await volunteerApplicationsService.applyToEvent(eventId, user.id, user.email);
      setApplied(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to apply");
    } finally {
      setLoading(false);
    }
  }, [eventId, user]);

  return { apply, loading, error, applied, checking };
}
