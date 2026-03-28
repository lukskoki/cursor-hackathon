import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import Constants from "expo-constants";

type SettingsItem = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  type: "nav" | "toggle";
  onPress?: () => void;
  toggleKey?: string;
};

type SectionData = {
  title: string;
  items: SettingsItem[];
};

export default function SettingsIndex() {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);

  const appVersion =
    Constants.expoConfig?.version ?? Constants.manifest?.version ?? "1.0.0";

  const sections: SectionData[] = [
    {
      title: "Account",
      items: [
        {
          icon: "person-outline",
          label: "Profile",
          type: "nav",
          onPress: () => router.push("/shared/settings/account"),
        },
        {
          icon: "lock-closed-outline",
          label: "Change Password",
          type: "nav",
          onPress: () => router.push("/shared/auth/forgot-password"),
        },
        {
          icon: "mail-outline",
          label: "Email Preferences",
          type: "nav",
          onPress: () => router.push("/shared/settings/notifications"),
        },
      ],
    },
    {
      title: "Notifications",
      items: [
        {
          icon: "notifications-outline",
          label: "Push Notifications",
          type: "toggle",
          toggleKey: "push",
        },
        {
          icon: "mail-unread-outline",
          label: "Email Notifications",
          type: "toggle",
          toggleKey: "email",
        },
      ],
    },
    {
      title: "Privacy",
      items: [
        {
          icon: "shield-checkmark-outline",
          label: "Data & Privacy",
          type: "nav",
          onPress: () => router.push("/shared/settings/privacy"),
        },
        {
          icon: "trash-outline",
          label: "Delete Account",
          type: "nav",
          onPress: () => router.push("/shared/settings/account"),
        },
      ],
    },
    {
      title: "About",
      items: [
        {
          icon: "information-circle-outline",
          label: `App Version ${appVersion}`,
          type: "nav",
          onPress: () => {},
        },
        {
          icon: "document-text-outline",
          label: "Terms of Service",
          type: "nav",
          onPress: () => {},
        },
        {
          icon: "eye-outline",
          label: "Privacy Policy",
          type: "nav",
          onPress: () => {},
        },
      ],
    },
  ];

  const getToggleValue = (key: string) =>
    key === "push" ? pushEnabled : emailEnabled;

  const handleToggle = (key: string) => {
    if (key === "push") setPushEnabled((v) => !v);
    else setEmailEnabled((v) => !v);
  };

  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.heading}>Settings</Text>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.card}>
              {section.items.map((item, idx) => (
                <Pressable
                  key={item.label}
                  style={[
                    styles.row,
                    idx < section.items.length - 1 && styles.rowBorder,
                  ]}
                  onPress={item.type === "nav" ? item.onPress : undefined}
                  disabled={item.type === "toggle"}
                >
                  <Ionicons
                    name={item.icon}
                    size={22}
                    color="#208AEF"
                    style={styles.rowIcon}
                  />
                  <Text style={styles.rowLabel}>{item.label}</Text>
                  {item.type === "toggle" && item.toggleKey ? (
                    <Switch
                      value={getToggleValue(item.toggleKey)}
                      onValueChange={() => handleToggle(item.toggleKey!)}
                      trackColor={{ false: "#ddd", true: "#208AEF" }}
                      thumbColor="#fff"
                    />
                  ) : (
                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: "#fafafa",
    borderRadius: 14,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  rowIcon: { marginRight: 14 },
  rowLabel: { flex: 1, fontSize: 16, color: "#222" },
});
