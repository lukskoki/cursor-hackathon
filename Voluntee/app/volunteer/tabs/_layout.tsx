import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

type TabIcon = React.ComponentProps<typeof Ionicons>["name"];

const TAB_CONFIG: { name: string; title: string; icon: TabIcon; iconFocused: TabIcon }[] = [
  { name: "home", title: "Home", icon: "home-outline", iconFocused: "home" },
  { name: "map", title: "Map", icon: "map-outline", iconFocused: "map" },
  { name: "leaderboard", title: "Ranking", icon: "trophy-outline", iconFocused: "trophy" },
  { name: "profile", title: "Profile", icon: "person-outline", iconFocused: "person" },
  { name: "notifications", title: "Alerts", icon: "notifications-outline", iconFocused: "notifications" },
];

export default function VolunteerTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#208AEF",
        tabBarInactiveTintColor: "#999",
        headerShown: false,
      }}
    >
      {TAB_CONFIG.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? tab.iconFocused : tab.icon}
                size={size}
                color={color}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
