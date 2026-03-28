import { useEffect, useState } from "react";
import { volunteerProfileService } from "@/services/volunteer/profile/volunteerProfileService";
import type { VolunteerProfileDetail } from "@/types/volunteer/profile";

export function useVolunteerProfile() {
  const [profile, setProfile] = useState<VolunteerProfileDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await volunteerProfileService.getProfile();
        if (!cancelled) setProfile(data);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load profile");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { profile, loading, error };
}
