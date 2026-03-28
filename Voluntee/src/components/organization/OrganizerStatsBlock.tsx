import { View, Text, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import type { OrganizerDashboardStats } from "@/types/organization/dashboard";

type OrganizerStatsBlockProps = {
  stats: OrganizerDashboardStats;
};

function formatCount(n: number): string {
  return n.toLocaleString("en-US");
}

export function OrganizerStatsBlock({ stats }: OrganizerStatsBlockProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.hero}>
        <Text style={styles.heroLabel}>TOTAL VOLUNTEERS REACHED</Text>
        <Text style={styles.heroValue}>{formatCount(stats.totalVolunteersReached)}</Text>
        <View style={styles.trendRow}>
          <Ionicons name="trending-up" size={18} color={colors.primary} />
          <Text style={styles.trendText}>
            +{stats.volunteersTrendPercent}% this month
          </Text>
        </View>
      </View>
      <View style={styles.row}>
        <View style={[styles.half, styles.eventsCard]}>
          <Text style={styles.smallLabel}>EVENTS HELD</Text>
          <Text style={styles.halfValue}>{formatCount(stats.eventsHeld)}</Text>
          <Text style={styles.pending}>{stats.eventsPending} pending</Text>
        </View>
        <View style={[styles.half, styles.impactCard]}>
          <Text style={styles.impactLabel}>IMPACT SCORE</Text>
          <Text style={styles.impactValue}>{stats.impactScore}</Text>
          <Text style={styles.impactHighlight}>{stats.impactRankLabel}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  hero: {
    backgroundColor: colors.statsHero,
    borderRadius: 16,
    padding: spacing.lg,
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.primary,
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  heroValue: {
    fontSize: 36,
    fontWeight: "800",
    color: colors.navy,
    letterSpacing: -1,
  },
  trendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: spacing.sm,
  },
  trendText: { fontSize: 14, fontWeight: "600", color: colors.primary },
  row: { flexDirection: "row", gap: spacing.md },
  half: { flex: 1, borderRadius: 16, padding: spacing.md, minHeight: 120 },
  eventsCard: { backgroundColor: colors.statsMuted },
  smallLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.muted,
    letterSpacing: 0.6,
    marginBottom: spacing.sm,
  },
  halfValue: { fontSize: 28, fontWeight: "800", color: colors.navy },
  pending: { fontSize: 13, color: colors.muted, marginTop: 4 },
  impactCard: { backgroundColor: colors.navy },
  impactLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255,255,255,0.65)",
    letterSpacing: 0.6,
    marginBottom: spacing.sm,
  },
  impactValue: { fontSize: 28, fontWeight: "800", color: "#fff" },
  impactHighlight: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
    marginTop: 4,
  },
});
