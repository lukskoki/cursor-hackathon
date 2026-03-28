import { useCallback, useEffect, useState } from "react";
import {
  getUpcomingEvents,
  type VolunteerEvent,
} from "@/services/volunteer/home/volunteerHomeService";

export function useRecommendedEvents(limit: number = 10) {
  const [events, setEvents] = useState<VolunteerEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUpcomingEvents(limit);
      setEvents(data);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { events, loading, error, refetch: fetch };
}
