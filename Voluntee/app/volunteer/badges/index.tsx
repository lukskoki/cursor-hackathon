import { type ComponentProps } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useVolunteerBadges } from "@/hooks/volunteer/profile/useVolunteerBadges";
import { Loader } from "@/components/shared/Loader";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import type { Badge } from "@/types/volunteer/badge";

const GOLD = "#F5A623";

function badgeIconName(icon: string): ComponentProps<typeof Ionicons>["name"] {
  const map: Record<string, ComponentProps<typeof Ionicons>["name"]> = {
    ribbon: "ribbon",
    people: "people",
    trophy: "trophy",
    leaf: "leaf",
    paw: "paw",
  };
  return map[icon] ?? "ellipse-outline";
}

function BadgeCard({ badge }: { badge: Badge }) {
  const pct = Math.min(badge.progress / badge.requirement, 1);

  return (
    <View style={[styles.card, !badge.unlocked && styles.cardLocked]}>
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: badge.unlocked ? GOLD : "#E5E5E5" },
        ]}
      >
        <Ionicons
          name={badgeIconName(badge.icon)}
          size={28}
          color={badge.unlocked ? "#fff" : colors.muted2}
        />
        {badge.unlocked && (
          <View style={styles.checkOverlay}>
            <Ionicons name="checkmark-circle" size={20} color="#34C759" />
          </View>
        )}
      </View>

      <Text
        style={[styles.badgeName, !badge.unlocked && styles.textMuted]}
        numberOfLines={1}
      >
        {badge.name}
      </Text>
      <Text
        style={[styles.badgeDesc, !badge.unlocked && styles.textMuted]}
        numberOfLines={2}
      >
        {badge.description}
      </Text>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${pct * 100}%` }]} />
      </View>
      <Text style={styles.progressLabel}>
        {badge.progress} / {badge.requirement}
      </Text>
    </View>
  );
}

export default function VolunteerBadges() {
  const { badges, loading, error } = useVolunteerBadges();

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <Loader />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Badges</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <>
            <View style={styles.summaryCard}>
              <Ionicons name="trophy" size={24} color={colors.primary} />
              <Text style={styles.summaryText}>
                {unlockedCount} of {badges.length} badges unlocked
              </Text>
            </View>

            <View style={styles.grid}>
              {badges.map((badge) => (
                <BadgeCard key={badge.id} badge={badge} />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backBtn: { width: 40, alignItems: "flex-start" },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  errorText: { padding: spacing.md, color: "#c00", textAlign: "center" },
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surfaceBadge,
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  card: {
    width: "48%",
    backgroundColor: colors.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: "center",
  },
  cardLocked: { opacity: 0.6 },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  checkOverlay: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: colors.background,
    borderRadius: 10,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },
  badgeDesc: {
    fontSize: 12,
    color: colors.muted,
    textAlign: "center",
    marginTop: 4,
    lineHeight: 16,
  },
  textMuted: { color: colors.muted2 },
  progressTrack: {
    width: "100%",
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surfaceMuted,
    marginTop: spacing.sm,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.muted2,
    marginTop: 4,
  },
});
