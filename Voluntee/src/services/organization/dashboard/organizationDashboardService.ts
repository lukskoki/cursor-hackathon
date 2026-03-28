import type { OrganizerDashboardData } from "@/types/organization/dashboard";
import {
  getMockOrganizerDashboard,
  mockDismissApplication,
} from "@/services/organization/dashboard/mockOrganizationDashboard";

export const organizationDashboardService = {
  async getDashboard(): Promise<OrganizerDashboardData> {
    return getMockOrganizerDashboard();
  },

  async updateApplicationStatus(applicationId: string, status: "approved" | "rejected"): Promise<void> {
    void status;
    mockDismissApplication(applicationId);
  },
};
