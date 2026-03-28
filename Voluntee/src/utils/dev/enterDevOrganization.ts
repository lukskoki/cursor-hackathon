import { router } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import type { OrganizationProfile } from "@/types/shared/user";

const DEV_ORG_PROFILE: OrganizationProfile = {
  id: "dev-organization",
  email: "dev-org@voluntee.local",
  role: "organization",
  organizationName: "Kinetic Community",
  oib: "00000000000",
  contactPersonName: "Dev organizer",
  city: "Zagreb",
  description: "Local dev bypass — not a real Firebase account.",
};

/** Sets an in-memory org profile and opens the organizer dashboard (development only). */
export function enterDevOrganizationDashboard(): void {
  useAuthStore.getState().setDevOrganizationBypass(true);
  useAuthStore.getState().setUser(DEV_ORG_PROFILE);
  router.replace("/organization/tabs/dashboard");
}
