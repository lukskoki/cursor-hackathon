import { createContext, useContext, type ReactNode } from "react";
import { useOrganizationDashboard } from "@/hooks/organization/dashboard/useOrganizationDashboard";

type OrganizationDashboardContextValue = ReturnType<typeof useOrganizationDashboard>;

const OrganizationDashboardContext = createContext<OrganizationDashboardContextValue | null>(null);

export function OrganizationDashboardProvider({ children }: { children: ReactNode }) {
  const value = useOrganizationDashboard();
  return (
    <OrganizationDashboardContext.Provider value={value}>
      {children}
    </OrganizationDashboardContext.Provider>
  );
}

export function useSharedOrganizationDashboard(): OrganizationDashboardContextValue {
  const ctx = useContext(OrganizationDashboardContext);
  if (!ctx) {
    throw new Error("useSharedOrganizationDashboard must be used within OrganizationDashboardProvider");
  }
  return ctx;
}
