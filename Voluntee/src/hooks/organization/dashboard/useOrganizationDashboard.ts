import { useCallback, useEffect, useState } from "react";
import { organizationDashboardService } from "@/services/organization/dashboard/organizationDashboardService";
import type { OrganizerDashboardData } from "@/types/organization/dashboard";

type UseOrganizationDashboardOptions = {
  /** When set, loads this org; otherwise uses EXPO_PUBLIC_DEV_ORGANIZATION_ID or auth user → organizations.owner_id. */
  organizationId?: string;
};

export function useOrganizationDashboard(options?: UseOrganizationDashboardOptions) {
  const organizationId = options?.organizationId;
  const [data, setData] = useState<OrganizerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await organizationDashboardService.getDashboard(organizationId);
      setData(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const approveApplication = useCallback(async (id: string) => {
    try {
      await organizationDashboardService.updateApplicationStatus(id, "approved");
      setData((prev) =>
        prev ? { ...prev, applications: prev.applications.filter((a) => a.id !== id) } : prev,
      );
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not approve application.");
    }
  }, []);

  const rejectApplication = useCallback(async (id: string) => {
    try {
      await organizationDashboardService.updateApplicationStatus(id, "rejected");
      setData((prev) =>
        prev ? { ...prev, applications: prev.applications.filter((a) => a.id !== id) } : prev,
      );
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not reject application.");
    }
  }, []);

  return {
    data,
    loading,
    error,
    refetch,
    approveApplication,
    rejectApplication,
  };
}
