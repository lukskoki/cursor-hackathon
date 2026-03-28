import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import type { OrganizerDashboardStats } from "@/types/organization/dashboard";

type OrganizerStatsBlockProps = { stats: OrganizerDashboardStats };

function formatNumber(n: number) {
  return n.toLocaleString("en-US");
}

export function OrganizerStatsBlock({ stats }: OrganizerStatsBlockProps) {
  return (
    <View style={styles.section}>
      <View style={styles.hero}>
        <View style={styles.heroDecor} />
        <Text style={styles.heroLabel}>TOTAL VOLUNTEERS REACHED</Text>
        <Text style={styles.heroValue}>{formatNumber(stats.totalVolunteersReached)}</Text>
        <View style={styles.trendRow}>
          <Ionicons name="trending-up" size={18} color={colors.statBlueText} />
          <Text style={styles.trendText}>+{stats.volunteersTrendPercent}% this month</Text>
        </View>
      </View>
      <View style={styles.miniRow}>
        <View style={[styles.miniCard, styles.miniLight]}>
          <Text style={styles.miniLabel}>EVENTS HELD</Text>
          <Text style={styles.miniValueLight}>{stats.eventsHeld}</Text>
          <Text style={styles.miniSubLight}>{stats.eventsPending} pending</Text>
        </View>
        <View style={[styles.miniCard, styles.miniDark]}>
          <Text style={styles.miniLabelOnDark}>IMPACT SCORE</Text>
          <Text style={styles.miniValueDark}>{stats.impactScore}</Text>
          <Text style={styles.miniSubDark}>{stats.impactRankLabel}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.md },
  hero: {
    borderRadius: 22,
    backgroundColor: colors.statBlueBg,
    padding: spacing.lg,
    overflow: "hidden",
    position: "relative",
  },
  heroDecor: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.statBlueSoft,
    opacity: 0.45,
    right: -36,
    top: -28,
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    color: colors.statBlueText,
    zIndex: 1,
  },
  heroValue: {
    marginTop: spacing.sm,
    fontSize: 40,
    fontWeight: "700",
    color: colors.navy,
    zIndex: 1,
  },
  trendRow: {
    marginTop: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    zIndex: 1,
  },
  trendText: { fontSize: 14, fontWeight: "600", color: colors.statBlueText },
  miniRow: { flexDirection: "row", gap: spacing.md },
  miniCard: {
    flex: 1,
    borderRadius: 20,
    padding: spacing.md,
    minHeight: 112,
    justifyContent: "center",
  },
  miniLight: { backgroundColor: colors.cardGray },
  miniDark: { backgroundColor: colors.navyDeep },
  miniLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.7,
    color: colors.captionGray,
  },
  miniLabelOnDark: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.7,
    color: "rgba(255,255,255,0.55)",
  },
  miniValueLight: {
    marginTop: spacing.sm,
    fontSize: 32,
    fontWeight: "700",
    color: colors.navy,
  },
  miniValueDark: {
    marginTop: spacing.sm,
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
  },
  miniSubLight: { marginTop: 4, fontSize: 13, color: colors.captionGray },
  miniSubDark: { marginTop: 4, fontSize: 13, color: colors.primary, fontWeight: "500" },
});
