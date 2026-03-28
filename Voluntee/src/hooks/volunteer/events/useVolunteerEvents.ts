import { useCallback, useEffect, useMemo, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { useAuthStore } from "@/store/authStore";
import {
  volunteerApplicationsService,
  type Application,
} from "@/services/volunteer/events/volunteerApplicationsService";
import { getFirebaseFirestore } from "@/services/shared/firebaseApp";

export type EventInfo = {
  title: string;
  organizerName: string;
  date: string;
};

export type EnrichedApplication = Application & {
  event: EventInfo | null;
};

export type StatusFilter = "all" | "pending" | "accepted" | "rejected";

async function batchFetchEvents(
  eventIds: string[],
): Promise<Record<string, EventInfo>> {
  const unique = [...new Set(eventIds)];
  const db = getFirebaseFirestore();
  const results: Record<string, EventInfo> = {};

  const fetches = unique.map(async (id) => {
    try {
      const snap = await getDoc(doc(db, "events", id));
      if (snap.exists()) {
        const d = snap.data();
        results[id] = {
          title: d.title ?? "Untitled Event",
          organizerName: d.organizerName ?? d.organizationName ?? "Unknown",
          date: d.date ?? d.eventDate ?? "",
        };
      }
    } catch {
      /* skip events that fail to load */
    }
  });

  await Promise.all(fetches);
  return results;
}

export function useVolunteerEvents(filter: StatusFilter = "all") {
  const user = useAuthStore((s) => s.user);
  const [applications, setApplications] = useState<EnrichedApplication[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchApplications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const raw = await volunteerApplicationsService.getMyApplications(user.id);
      const eventIds = raw.map((a) => a.eventId);
      const eventMap = await batchFetchEvents(eventIds);

      const enriched: EnrichedApplication[] = raw.map((a) => ({
        ...a,
        event: eventMap[a.eventId] ?? null,
      }));
      setApplications(enriched);
    } catch {
      /* best-effort */
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const filtered = useMemo(() => {
    if (filter === "all") return applications;
    return applications.filter((a) => a.status === filter);
  }, [applications, filter]);

  return { applications: filtered, loading, refresh: fetchApplications };
}
