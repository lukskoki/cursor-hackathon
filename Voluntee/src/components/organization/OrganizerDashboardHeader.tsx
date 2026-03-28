import { View, Text, Image, StyleSheet } from "react-native";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

const ORG_AVATAR = "https://i.pravatar.cc/128?img=68";

type OrganizerDashboardHeaderProps = {
  organizationName: string;
  subtitle: string;
};

export function OrganizerDashboardHeader({
  organizationName,
  subtitle,
}: OrganizerDashboardHeaderProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <Image source={{ uri: ORG_AVATAR }} style={styles.avatar} />
        <Text style={styles.brand} numberOfLines={1}>
          {organizationName}
        </Text>
      </View>
      <Text style={styles.pageTitle}>Organizer Dashboard</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.border },
  brand: { flex: 1, fontSize: 17, fontWeight: "700", color: colors.navy },
  pageTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.navy,
    letterSpacing: -0.5,
    marginBottom: spacing.xs,
  },
  subtitle: { fontSize: 15, color: colors.muted, lineHeight: 22 },
});
