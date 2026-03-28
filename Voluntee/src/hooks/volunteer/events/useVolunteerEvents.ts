import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import {
  volunteerApplicationsService,
  type Application,
} from "@/services/volunteer/events/volunteerApplicationsService";

export function useVolunteerEvents() {
  const user = useAuthStore((s) => s.user);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchApplications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const results = await volunteerApplicationsService.getMyApplications(user.id);
      setApplications(results);
    } catch {
      /* best-effort */
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  return { applications, loading, refresh: fetchApplications };
}
