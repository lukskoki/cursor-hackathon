import { useEffect, useState, useCallback } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getFirebaseFirestore } from "@/services/shared/firebaseApp";
import type { VolunteerEvent } from "@/types/volunteer/event";

type EditEventState = {
  event: VolunteerEvent | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  success: boolean;
};

export function useEditEvent(eventId: string | undefined) {
  const [state, setState] = useState<EditEventState>({
    event: null,
    loading: true,
    saving: false,
    error: null,
    success: false,
  });

  useEffect(() => {
    if (!eventId) {
      setState((s) => ({ ...s, loading: false }));
      return;
    }

    let cancelled = false;
    const db = getFirebaseFirestore();

    (async () => {
      try {
        const snap = await getDoc(doc(db, "events", eventId));
        if (cancelled) return;
        if (snap.exists()) {
          setState((s) => ({
            ...s,
            event: { id: snap.id, ...snap.data() } as VolunteerEvent,
            loading: false,
          }));
        } else {
          setState((s) => ({
            ...s,
            loading: false,
            error: "Event not found",
          }));
        }
      } catch (err) {
        if (cancelled) return;
        setState((s) => ({
          ...s,
          loading: false,
          error: err instanceof Error ? err.message : "Failed to load event",
        }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const update = useCallback(
    async (data: Partial<Omit<VolunteerEvent, "id">>) => {
      if (!eventId) return;
      setState((s) => ({ ...s, saving: true, error: null, success: false }));
      try {
        const db = getFirebaseFirestore();
        await updateDoc(doc(db, "events", eventId), data);
        setState((s) => ({
          ...s,
          saving: false,
          success: true,
          event: s.event ? { ...s.event, ...data } : s.event,
        }));
      } catch (err) {
        setState((s) => ({
          ...s,
          saving: false,
          error: err instanceof Error ? err.message : "Failed to update event",
        }));
      }
    },
    [eventId],
  );

  return {
    event: state.event,
    loading: state.loading,
    saving: state.saving,
    error: state.error,
    success: state.success,
    update,
  };
}
