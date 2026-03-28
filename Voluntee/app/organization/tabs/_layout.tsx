import { Tabs } from "expo-router";
import { PlatformPressable } from "@react-navigation/elements";
import type { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { OrganizationDashboardProvider } from "@/contexts/OrganizationDashboardContext";

const TAB_BAR_HEIGHT = 60;
const TAB_BAR_BOTTOM_GAP = 0;
const TAB_BAR_SIDE_MARGIN = "5%";
const TAB_BAR_DROP_PX = 5;
const ACTIVE_BLUE = "#208AEF";
const INACTIVE_GRAY = "#999999";
const TAB_PILL_BG = "#FFFFFF";
const TAB_PILL_BORDER = "rgba(0, 0, 0, 0.08)";

type OrgTabIcon = "speedometer" | "people" | "person-circle";

const TAB_CONFIG: {
  name: string;
  title: string;
  icon: OrgTabIcon;
}[] = [
  { name: "dashboard", title: "Home", icon: "speedometer" },
  { name: "profile", title: "Profile", icon: "person-circle" },
  { name: "applicants", title: "Applicants", icon: "people" },
];

function OrgTabIcon({
  name,
  color,
  focused,
}: {
  name: OrgTabIcon;
  color: string;
  focused: boolean;
}) {
  const map: Record<OrgTabIcon, keyof typeof Ionicons.glyphMap> = {
    speedometer: focused ? "speedometer" : "speedometer-outline",
    people: focused ? "people" : "people-outline",
    "person-circle": focused ? "person-circle" : "person-circle-outline",
  };
  return <Ionicons name={map[name]} size={22} color={color} />;
}

function GlassTabBarButton(props: BottomTabBarButtonProps) {
  const { children, style, ...rest } = props;
  const focused = rest.accessibilityState?.selected === true;

  return (
    <PlatformPressable {...rest} style={[styles.tabPressable, style]}>
      <View style={styles.tabInner}>
        {focused ? (
          <View style={styles.pillAnchor} pointerEvents="none">
            <View style={styles.selectionPill} />
          </View>
        ) : null}
        {children}
      </View>
    </PlatformPressable>
  );
}

function TabBarPillBackground() {
  return <View style={styles.barPillBg} pointerEvents="none" />;
}

export default function OrganizationTabsLayout() {
  const insets = useSafeAreaInsets();
  const tabBarBottom = Math.max(
    0,
    insets.bottom + TAB_BAR_BOTTOM_GAP - TAB_BAR_DROP_PX,
  );
  const contentBottomPad = TAB_BAR_HEIGHT + tabBarBottom + 8;

  return (
    <OrganizationDashboardProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: ACTIVE_BLUE,
          tabBarInactiveTintColor: INACTIVE_GRAY,
          tabBarActiveBackgroundColor: "transparent",
          tabBarInactiveBackgroundColor: "transparent",
          headerShown: false,
          tabBarShowLabel: true,
          tabBarLabelPosition: "below-icon",
          tabBarIconStyle: styles.tabIconWrap,
          tabBarLabelStyle: styles.tabLabel,
          tabBarItemStyle: styles.tabItem,
          tabBarButton: (p) => <GlassTabBarButton {...p} />,
          tabBarBackground: () => <TabBarPillBackground />,
          sceneStyle: {
            flex: 1,
            paddingBottom: contentBottomPad,
            backgroundColor: "transparent",
          },
          tabBarStyle: {
            position: "absolute",
            left: TAB_BAR_SIDE_MARGIN,
            right: TAB_BAR_SIDE_MARGIN,
            bottom: tabBarBottom,
            height: TAB_BAR_HEIGHT,
            minHeight: TAB_BAR_HEIGHT,
            maxHeight: TAB_BAR_HEIGHT,
            paddingHorizontal: 0,
            paddingTop: 0,
            paddingBottom: 0,
            margin: 0,
            borderRadius: TAB_BAR_HEIGHT / 2,
            overflow: "hidden",
            backgroundColor: "transparent",
            borderWidth: 0,
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
          },
        }}
      >
        {TAB_CONFIG.map((tab) => (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              title: tab.title,
              tabBarIcon: ({ color, focused }) => (
                <OrgTabIcon name={tab.icon} color={color} focused={focused} />
              ),
            }}
          />
        ))}
        <Tabs.Screen
          name="events"
          options={{
            href: null,
            title: "Events",
          }}
        />
      </Tabs>
    </OrganizationDashboardProvider>
  );
}

const styles = StyleSheet.create({
  barPillBg: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: TAB_BAR_HEIGHT / 2,
    backgroundColor: TAB_PILL_BG,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: TAB_PILL_BORDER,
  },
  tabPressable: {
    flex: 1,
  },
  tabInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 2,
  },
  pillAnchor: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  selectionPill: {
    minWidth: 76,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(32, 138, 239, 0.12)",
  },
  tabIconWrap: {
    marginBottom: 2,
    alignSelf: "center",
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 13,
    textAlign: "center",
    alignSelf: "center",
    ...(Platform.OS === "android" ? { includeFontPadding: false } : {}),
  },
  tabItem: {
    flex: 1,
    paddingVertical: 4,
    alignItems: "center",
    justifyContent: "center",
  },
});
