import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import { organizationEventsService } from "@/services/organization/events/organizationEventsService";
import type { VolunteerEvent } from "@/types/volunteer/event";

export function useOrganizationEvents() {
  const user = useAuthStore((s) => s.user);
  const [events, setEvents] = useState<VolunteerEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!user) {
      setEvents([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await organizationEventsService.getOrgEvents(user.id);
      setEvents(data);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load events");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { events, loading, error, refetch: fetch };
}
