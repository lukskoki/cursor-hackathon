import { Tabs } from "expo-router";
import { OrganizationDashboardProvider } from "@/contexts/OrganizationDashboardContext";

export default function OrganizationTabsLayout() {
  return (
    <OrganizationDashboardProvider>
    <Tabs>
      <Tabs.Screen name="dashboard" options={{ title: "Dashboard", headerShown: false }} />
      <Tabs.Screen
        name="events"
        options={{
          href: null,
          title: "Events",
        }}
      />
      <Tabs.Screen name="applicants" options={{ title: "Applicants" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
    </OrganizationDashboardProvider>
  );
}
