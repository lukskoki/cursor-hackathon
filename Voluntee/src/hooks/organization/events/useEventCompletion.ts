import { useState, useCallback } from "react";
import { eventCompletionService } from "@/services/organization/events/eventCompletionService";

export function useEventCompletion() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completeVolunteer = useCallback(
    async (applicationId: string, eventId: string, volunteerId: string) => {
      setLoading(true);
      setError(null);
      try {
        await eventCompletionService.completeVolunteer(
          applicationId,
          eventId,
          volunteerId,
        );
      } catch (e: any) {
        setError(e?.message ?? "Failed to complete volunteer");
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const completeAll = useCallback(async (eventId: string) => {
    setLoading(true);
    setError(null);
    try {
      const count = await eventCompletionService.completeAllForEvent(eventId);
      return count;
    } catch (e: any) {
      setError(e?.message ?? "Failed to complete volunteers");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { completeVolunteer, completeAll, loading, error };
}
