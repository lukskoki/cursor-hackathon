import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import {
  organizationProfileService,
  type OrgProfileData,
  type OrgProfileUpdate,
} from "@/services/organization/profile/organizationProfileService";

export function useOrganizationProfile() {
  const uid = useAuthStore((s) => s.user?.id) ?? null;

  const [profile, setProfile] = useState<OrgProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const data = await organizationProfileService.getProfile(uid);
        if (!cancelled) setProfile(data);
      } catch (e: any) {
        if (!cancelled) setError(e.message ?? "Failed to load profile");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [uid]);

  const updateProfile = useCallback(
    async (data: OrgProfileUpdate) => {
      if (!uid) return;
      try {
        setSaving(true);
        await organizationProfileService.updateProfile(uid, data);
        setProfile((prev) => (prev ? { ...prev, ...data } : prev));
      } catch (e: any) {
        setError(e.message ?? "Failed to save profile");
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [uid],
  );

  return { profile, loading, error, saving, updateProfile };
}
