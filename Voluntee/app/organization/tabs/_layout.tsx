import { Tabs } from "expo-router";

export default function OrganizationTabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="dashboard" options={{ title: "Dashboard" }} />
      <Tabs.Screen name="events" options={{ title: "Events" }} />
      <Tabs.Screen name="applicants" options={{ title: "Applicants" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
      <Tabs.Screen name="notifications" options={{ title: "Notifications" }} />
    </Tabs>
  );
}
