import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

type OrganizerDashboardHeaderProps = {
  organizationName: string;
  subtitle: string;
  avatarUrl?: string;
  onPressNotifications?: () => void;
};

export function OrganizerDashboardHeader({
  organizationName,
  subtitle,
  avatarUrl = "https://i.pravatar.cc/128?img=68",
  onPressNotifications,
}: OrganizerDashboardHeaderProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <View style={styles.brand}>
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          <Text style={styles.brandName} numberOfLines={1}>
            {organizationName}
          </Text>
        </View>
        <Pressable
          onPress={onPressNotifications}
          style={({ pressed }) => [styles.bell, pressed && styles.bellPressed]}
          hitSlop={12}
        >
          <Ionicons name="notifications-outline" size={24} color={colors.navy} />
        </Pressable>
      </View>
      <Text style={styles.title}>Organizer Dashboard</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  brand: { flexDirection: "row", alignItems: "center", flex: 1, marginRight: spacing.md },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.border },
  brandName: {
    marginLeft: spacing.sm,
    fontSize: 17,
    fontWeight: "700",
    color: colors.navy,
    flex: 1,
  },
  bell: { padding: spacing.xs },
  bellPressed: { opacity: 0.6 },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.navy,
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: spacing.sm,
    fontSize: 15,
    color: colors.muted,
    lineHeight: 22,
  },
});
