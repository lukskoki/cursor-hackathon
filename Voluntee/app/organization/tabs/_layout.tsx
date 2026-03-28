import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { OrganizationDashboardProvider } from "@/contexts/OrganizationDashboardContext";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const TABS: { name: string; title: string; icon: IconName; iconFocused: IconName; hidden?: boolean }[] = [
  { name: "dashboard", title: "Dashboard", icon: "grid-outline", iconFocused: "grid" },
  { name: "events", title: "Events", icon: "calendar-outline", iconFocused: "calendar", hidden: true },
  { name: "applicants", title: "Applicants", icon: "people-outline", iconFocused: "people" },
  { name: "profile", title: "Profile", icon: "person-outline", iconFocused: "person" },
];

export default function OrganizationTabsLayout() {
  return (
    <OrganizationDashboardProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#208AEF",
          tabBarInactiveTintColor: "#999",
        }}
      >
        {TABS.map((tab) => (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              title: tab.title,
              href: tab.hidden ? null : undefined,
              tabBarIcon: ({ color, focused }) => (
                <Ionicons name={focused ? tab.iconFocused : tab.icon} size={22} color={color} />
              ),
            }}
          />
        ))}
      </Tabs>
    </OrganizationDashboardProvider>
  );
}
