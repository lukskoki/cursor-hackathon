import { useCallback, useEffect, useState } from "react";
import { organizationDashboardService } from "@/services/organization/dashboard/organizationDashboardService";
import { useAuthStore } from "@/store/authStore";
import type { OrganizerDashboardData } from "@/types/organization/dashboard";

export function useOrganizationDashboard() {
  const user = useAuthStore((s) => s.user);
  const [data, setData] = useState<OrganizerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const orgName = user.role === "organization" ? user.organizationName : "Organization";
      const city = user.role === "organization" ? user.city : undefined;
      const next = await organizationDashboardService.getDashboard(user.id, orgName, city);
      setData(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const approveApplication = useCallback(async (id: string) => {
    try {
      await organizationDashboardService.updateApplicationStatus(id, "accepted");
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
