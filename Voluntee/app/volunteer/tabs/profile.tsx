import { useState, type ComponentProps } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { authService } from "@/services/shared/authService";
import { useAuthStore } from "@/store/authStore";
import { useVolunteerProfile } from "@/hooks/volunteer/profile/useVolunteerProfile";
import { Loader } from "@/components/shared/Loader";
import { ReviewCard } from "@/components/volunteer/ReviewCard";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import type {
  VolunteerPastActivity,
  VolunteerProfileBadge,
} from "@/types/volunteer/profile";

type ProfileTab = "activities" | "reviews" | "interests";

export default function VolunteerProfile() {
  const { profile, loading, error } = useVolunteerProfile();
  const [tab, setTab] = useState<ProfileTab>("activities");

  const handleLogout = async () => {
    await authService.signOutUser();
    useAuthStore.getState().setUser(null);
    router.replace("/");
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <Loader />
      </SafeAreaView>
    );
  }

  if (error || !profile) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <Text style={styles.errorText}>{error ?? "Profile unavailable"}</Text>
      </SafeAreaView>
    );
  }

  const accent = colors.profileAccent;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.topBar}>
          <Image
            source={{ uri: profile.avatarUrl }}
            style={styles.topBarAvatar}
          />
          <Text style={styles.appTitle} numberOfLines={1}>
            {profile.appName}
          </Text>
          <Pressable
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => router.push("/volunteer/tabs/notifications")}
            style={styles.iconBtn}
          >
            <Ionicons name="notifications-outline" size={22} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.hero}>
          <View style={[styles.avatarRing, { borderColor: accent }]}>
            <Image
              source={{ uri: profile.avatarUrl }}
              style={styles.avatarImg}
            />
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark" size={12} color="#fff" />
            </View>
          </View>
          <Text style={styles.displayName}>{profile.displayName}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={16} color={colors.muted} />
            <Text style={styles.locationText}>{profile.location}</Text>
          </View>
          <Text style={styles.bio}>{profile.bio}</Text>
        </View>

        <View style={[styles.pointsCard, { backgroundColor: colors.surfaceMuted }]}>
          <View>
            <Text style={styles.pointsLabel}>TOTAL POINTS</Text>
            <Text style={styles.pointsValue}>
              {formatNumber(profile.totalPoints)} XP
            </Text>
          </View>
          <View style={[styles.pointsIcon, { backgroundColor: accent }]}>
            <Ionicons name="flash" size={22} color="#fff" />
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.surfaceMuted }]}>
            <Text style={styles.statCardLabel}>EVENTS</Text>
            <Text style={styles.statCardValue}>{profile.eventsCompleted}</Text>
            <Text style={styles.statCardSub}>Completed</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surfaceMuted }]}>
            <Text style={styles.statCardLabel}>IMPACT</Text>
            <Text style={styles.statCardValue}>{profile.impactHours}</Text>
            <Text style={styles.statCardSub}>Hours Given</Text>
          </View>
        </View>

        <View style={styles.badgesHeader}>
          <Text style={styles.sectionTitle}>Unlocked Badges</Text>
          <Pressable hitSlop={8}>
            <Text style={[styles.viewAll, { color: accent }]}>View All</Text>
          </Pressable>
        </View>
        <View style={styles.badgesRow}>
          {profile.badges.length === 0 ? (
            <Text style={styles.emptyHint}>No badges yet — join events to earn them.</Text>
          ) : (
            profile.badges.map((b) => (
              <ProfileBadgeIcon key={b.id} badge={b} accent={accent} />
            ))
          )}
        </View>

        <View style={styles.segment}>
          <SegmentButton
            label="Past Activities"
            active={tab === "activities"}
            onPress={() => setTab("activities")}
          />
          <SegmentButton
            label="Reviews"
            active={tab === "reviews"}
            onPress={() => setTab("reviews")}
          />
          <SegmentButton
            label="Interests"
            active={tab === "interests"}
            onPress={() => setTab("interests")}
          />
        </View>

        {tab === "activities" && (
          <View style={styles.tabContent}>
            {profile.pastActivities.length === 0 ? (
              <Text style={styles.emptyHint}>No completed activities yet.</Text>
            ) : (
              profile.pastActivities.map((a) => (
                <PastActivityCard key={a.id} activity={a} accent={accent} />
              ))
            )}
          </View>
        )}
        {tab === "reviews" && (
          <View style={styles.tabContent}>
            {profile.reviews.length === 0 ? (
              <Text style={styles.emptyHint}>No reviews yet.</Text>
            ) : (
              profile.reviews.map((r) => (
                <ReviewCard
                  key={r.id}
                  author={r.authorName}
                  body={r.body}
                  rating={r.rating}
                />
              ))
            )}
          </View>
        )}
        {tab === "interests" && (
          <View style={styles.interestsWrap}>
            {profile.interests.length === 0 ? (
              <Text style={styles.emptyHint}>No interests listed yet.</Text>
            ) : (
              profile.interests.map((i) => (
                <View key={i.id} style={styles.interestChip}>
                  <Text style={styles.interestChipText}>{i.label}</Text>
                </View>
              ))
            )}
          </View>
        )}

        <Pressable style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutTxt}>Log out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function formatNumber(n: number) {
  return n.toLocaleString("en-US");
}

function badgeIconName(
  icon: VolunteerProfileBadge["icon"]
): ComponentProps<typeof Ionicons>["name"] {
  switch (icon) {
    case "footprints":
      return "footsteps";
    case "helper":
      return "diamond-outline";
    case "leaf":
      return "leaf-outline";
    case "leader":
      return "star-outline";
    default:
      return "ellipse-outline";
  }
}

function ProfileBadgeIcon({
  badge,
  accent,
}: {
  badge: VolunteerProfileBadge;
  accent: string;
}) {
  const unlocked = badge.unlocked;
  return (
    <View style={styles.badgeItem}>
      <View
        style={[
          styles.badgeCircle,
          {
            backgroundColor: unlocked ? colors.surfaceBadge : "#ECECED",
            opacity: unlocked ? 1 : 0.85,
          },
        ]}
      >
        <Ionicons
          name={badgeIconName(badge.icon)}
          size={26}
          color={unlocked ? accent : colors.muted2}
        />
        {unlocked ? (
          <View style={styles.badgeCheck}>
            <Ionicons name="checkmark" size={9} color="#fff" />
          </View>
        ) : null}
      </View>
      <Text
        style={[styles.badgeName, !unlocked && { color: colors.muted2 }]}
        numberOfLines={1}
      >
        {badge.name}
      </Text>
    </View>
  );
}

function PastActivityCard({
  activity,
  accent,
}: {
  activity: VolunteerPastActivity;
  accent: string;
}) {
  const primary = activity.accent === "primary";
  const borderColor = primary ? accent : "#E0E0E0";
  const headerColor = primary ? accent : colors.muted2;
  const pillBg = primary ? colors.surfaceBadge : colors.surfaceMuted;
  const pillText = primary ? accent : colors.muted2;

  return (
    <View style={[styles.activityCard, { borderLeftColor: borderColor }]}>
      <View style={styles.activityTop}>
        <Text style={[styles.activityMeta, { color: headerColor }]}>
          {activity.category} • {activity.timeAgo}
        </Text>
        <View style={[styles.pointsPill, { backgroundColor: pillBg }]}>
          <Text style={[styles.pointsPillText, { color: pillText }]}>
            + {formatNumber(activity.points)} pts
          </Text>
        </View>
      </View>
      <Text style={styles.activityTitle}>{activity.title}</Text>
      <View style={styles.activityCols}>
        <View>
          <Text style={styles.activityColLabel}>{activity.leftLabel}</Text>
          <Text style={styles.activityColValue}>{activity.leftValue}</Text>
        </View>
        <View style={styles.activityColRight}>
          <Text style={styles.activityColLabel}>{activity.rightLabel}</Text>
          <Text style={styles.activityColValue}>{activity.rightValue}</Text>
        </View>
      </View>
    </View>
  );
}

function SegmentButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.segmentBtn, active && styles.segmentBtnActive]}
    >
      <Text
        style={[styles.segmentBtnText, active && styles.segmentBtnTextActive]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scrollContent: {
    paddingBottom: spacing.xl + spacing.md,
  },
  errorText: { padding: spacing.md, color: "#c00" },
  emptyHint: {
    fontSize: 14,
    color: colors.muted,
    textAlign: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  topBarAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceMuted,
  },
  appTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
  },
  iconBtn: { padding: 4 },
  hero: { alignItems: "center", paddingHorizontal: spacing.lg, marginTop: spacing.sm },
  avatarRing: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 4,
    padding: 3,
    marginBottom: spacing.md,
  },
  avatarImg: {
    width: "100%",
    height: "100%",
    borderRadius: 999,
    backgroundColor: colors.surfaceMuted,
  },
  verifiedBadge: {
    position: "absolute",
    right: 4,
    bottom: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  displayName: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  locationText: { fontSize: 14, color: colors.muted },
  bio: {
    marginTop: spacing.md,
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
    textAlign: "center",
  },
  pointsCard: {
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    borderRadius: 14,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pointsLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.6,
    color: colors.muted2,
  },
  pointsValue: {
    marginTop: 4,
    fontSize: 26,
    fontWeight: "700",
    color: colors.text,
  },
  pointsIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    padding: spacing.md,
  },
  statCardLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
    color: colors.muted2,
  },
  statCardValue: {
    marginTop: 6,
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
  },
  statCardSub: {
    marginTop: 4,
    fontSize: 13,
    color: colors.muted,
  },
  badgesHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: colors.text },
  viewAll: { fontSize: 14, fontWeight: "600" },
  badgesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  badgeItem: { width: "22%", alignItems: "center" },
  badgeCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeCheck: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeName: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: "600",
    color: colors.text,
    textAlign: "center",
  },
  segment: {
    flexDirection: "row",
    marginHorizontal: spacing.md,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentBtnActive: {
    backgroundColor: colors.background,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.muted2,
  },
  segmentBtnTextActive: {
    color: colors.text,
    fontWeight: "700",
  },
  tabContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  activityCard: {
    borderRadius: 12,
    backgroundColor: colors.background,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
  },
  activityTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  activityMeta: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.4,
    flex: 1,
  },
  pointsPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  pointsPillText: { fontSize: 12, fontWeight: "700" },
  activityTitle: {
    marginTop: spacing.sm,
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
  },
  activityCols: {
    flexDirection: "row",
    marginTop: spacing.md,
    justifyContent: "space-between",
  },
  activityColRight: { alignItems: "flex-end" },
  activityColLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    color: colors.muted2,
  },
  activityColValue: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  interestsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  interestChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.surfaceMuted,
  },
  interestChipText: { fontSize: 14, fontWeight: "600", color: colors.text },
  logoutBtn: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#e53e3e",
    alignItems: "center",
  },
  logoutTxt: { color: "#e53e3e", fontSize: 15, fontWeight: "600" },
});
