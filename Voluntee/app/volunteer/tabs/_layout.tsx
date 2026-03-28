import { Tabs } from "expo-router";
import { PlatformPressable } from "@react-navigation/elements";
import type { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { Platform, StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TAB_BAR_HEIGHT = 60;
const TAB_BAR_BOTTOM_GAP = 0;
const TAB_BAR_SIDE_MARGIN = "5%";
const TAB_BAR_DROP_PX = 5;
const ACTIVE_BLUE = "#208AEF";
const INACTIVE_GRAY = "#999999";
const TAB_PILL_BG = "#FFFFFF";
const TAB_PILL_BORDER = "rgba(0, 0, 0, 0.08)";
const ICON_SIZE = 22;

type TabIconName = "home" | "profile" | "map";

const HERO_PATHS: Record<TabIconName, string> = {
  home:
    "m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25",
  profile:
    "M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
  map:
    "M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z",
};

function TabHeroIcon({ name, color }: { name: TabIconName; color: string }) {
  return (
    <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none">
      <Path
        d={HERO_PATHS[name]}
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const TAB_CONFIG: { name: string; title: string; icon: TabIconName }[] = [
  { name: "home", title: "Home", icon: "home" },
  { name: "profile", title: "Profile", icon: "profile" },
  { name: "map", title: "Map", icon: "map" },
];

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

export default function VolunteerTabsLayout() {
  const insets = useSafeAreaInsets();
  const tabBarBottom = Math.max(
    0,
    insets.bottom + TAB_BAR_BOTTOM_GAP - TAB_BAR_DROP_PX,
  );
  const contentBottomPad = TAB_BAR_HEIGHT + tabBarBottom + 8;

  return (
    <Tabs
      safeAreaInsets={{ bottom: 0, left: 0, right: 0 }}
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
          backgroundColor: "#FFFFFF",
        },
        sceneContainerStyle: {
          backgroundColor: "#FFFFFF",
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
          marginHorizontal: 0,
          borderRadius: TAB_BAR_HEIGHT / 2,
          overflow: "hidden",
          backgroundColor: "transparent",
          borderWidth: 0,
          borderTopWidth: 0,
          borderBottomWidth: 0,
          borderLeftWidth: 0,
          borderRightWidth: 0,
          borderColor: "transparent",
          elevation: 0,
          shadowOpacity: 0,
          shadowRadius: 0,
          shadowOffset: { width: 0, height: 0 },
        },
      }}
    >
      {TAB_CONFIG.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color }) => (
              <TabHeroIcon name={tab.icon} color={color} />
            ),
          }}
        />
      ))}
      <Tabs.Screen name="leaderboard" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
    </Tabs>
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
