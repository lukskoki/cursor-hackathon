import { useState } from "react";
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
import { useSharedOrganizationDashboard } from "@/contexts/OrganizationDashboardContext";
import { Loader } from "@/components/shared/Loader";
import { ReviewCard } from "@/components/volunteer/ReviewCard";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import type { OrganizerEventListRow } from "@/types/organization/dashboard";

const ORG_AVATAR_FALLBACK =
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=256&q=80";

type ProfileTab = "events" | "reviews" | "info";

export default function OrganizationProfile() {
  const user = useAuthStore((s) => s.user);
  const { data: dash, loading, error } = useSharedOrganizationDashboard();
  const [tab, setTab] = useState<ProfileTab>("events");

  const handleLogout = async () => {
    await authService.signOutUser();
    useAuthStore.getState().setDevOrganizationBypass(false);
    useAuthStore.getState().setUser(null);
    router.replace("/");
  };

  if (user?.role !== "organization") {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <Text style={styles.errorText}>Organization profile only.</Text>
      </SafeAreaView>
    );
  }

  if (loading && !dash) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <Loader />
      </SafeAreaView>
    );
  }

  const accent = colors.profileAccent;
  const orgName = user.organizationName;
  const city = user.city?.trim() || "Zagreb, Croatia";
  const bio =
    user.description?.trim() ||
    "Leading local initiatives and connecting volunteers with meaningful opportunities.";
  const avatarUri = ORG_AVATAR_FALLBACK;
  const appTitle = "Voluntee";

  const eventsHeld = dash?.stats.eventsHeld ?? 0;
  const volunteers = dash?.stats.totalVolunteersReached ?? 0;
  const impact = dash?.stats.impactScore ?? "—";
  const pending = dash?.stats.eventsPending ?? 0;
  const allEvents = dash?.allEvents ?? [];

  const orgBadges = [
    { id: "b1", name: "Trusted host", icon: "shield-checkmark-outline" as const, unlocked: true },
    { id: "b2", name: "Community", icon: "heart-outline" as const, unlocked: true },
    { id: "b3", name: "Eco lead", icon: "leaf-outline" as const, unlocked: eventsHeld >= 10 },
    { id: "b4", name: "Top tier", icon: "trophy-outline" as const, unlocked: false },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.topBar}>
          <Image source={{ uri: avatarUri }} style={styles.topBarAvatar} />
          <Text style={styles.appTitle} numberOfLines={1}>
            {appTitle}
          </Text>
          <Pressable accessibilityRole="button" hitSlop={8} style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={22} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.hero}>
          <View style={[styles.avatarRing, { borderColor: accent }]}>
            <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark" size={12} color="#fff" />
            </View>
          </View>
          <Text style={styles.displayName}>{orgName}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={16} color={colors.muted} />
            <Text style={styles.locationText}>{city}</Text>
          </View>
          <Text style={styles.bio}>{bio}</Text>
        </View>

        <View style={[styles.pointsCard, { backgroundColor: colors.surfaceMuted }]}>
          <View>
            <Text style={styles.pointsLabel}>IMPACT SCORE</Text>
            <Text style={styles.pointsValue}>
              {impact !== "—" ? `${impact} / 10` : "—"}
            </Text>
            {dash?.stats.impactRankLabel ? (
              <Text style={styles.impactRank}>{dash.stats.impactRankLabel}</Text>
            ) : null}
          </View>
          <View style={[styles.pointsIcon, { backgroundColor: accent }]}>
            <Ionicons name="pulse" size={22} color="#fff" />
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.surfaceMuted }]}>
            <Text style={styles.statCardLabel}>EVENTS</Text>
            <Text style={styles.statCardValue}>{eventsHeld}</Text>
            <Text style={styles.statCardSub}>Held</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surfaceMuted }]}>
            <Text style={styles.statCardLabel}>REACH</Text>
            <Text style={styles.statCardValue}>{formatNumber(volunteers)}</Text>
            <Text style={styles.statCardSub}>Volunteers</Text>
          </View>
        </View>

        {error ? (
          <Text style={styles.warnBanner}>{error}</Text>
        ) : null}

        <View style={styles.badgesHeader}>
          <Text style={styles.sectionTitle}>Organization badges</Text>
          <Pressable hitSlop={8}>
            <Text style={[styles.viewAll, { color: accent }]}>View All</Text>
          </Pressable>
        </View>
        <View style={styles.badgesRow}>
          {orgBadges.map((b) => (
            <View key={b.id} style={styles.badgeItem}>
              <View
                style={[
                  styles.badgeCircle,
                  {
                    backgroundColor: b.unlocked ? colors.surfaceBadge : "#ECECED",
                    opacity: b.unlocked ? 1 : 0.85,
                  },
                ]}
              >
                <Ionicons
                  name={b.icon}
                  size={26}
                  color={b.unlocked ? accent : colors.muted2}
                />
                {b.unlocked ? (
                  <View style={styles.badgeCheck}>
                    <Ionicons name="checkmark" size={9} color="#fff" />
                  </View>
                ) : null}
              </View>
              <Text
                style={[styles.badgeName, !b.unlocked && { color: colors.muted2 }]}
                numberOfLines={1}
              >
                {b.name}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.segment}>
          <SegmentButton
            label="Events"
            active={tab === "events"}
            onPress={() => setTab("events")}
          />
          <SegmentButton
            label="Reviews"
            active={tab === "reviews"}
            onPress={() => setTab("reviews")}
          />
          <SegmentButton
            label="Info"
            active={tab === "info"}
            onPress={() => setTab("info")}
          />
        </View>

        {tab === "events" && (
          <View style={styles.tabContent}>
            {allEvents.length === 0 ? (
              <Text style={styles.emptyHint}>No events listed yet.</Text>
            ) : (
              allEvents.map((e) => <OrgEventRow key={e.id} event={e} accent={accent} />)
            )}
          </View>
        )}
        {tab === "reviews" && (
          <View style={styles.tabContent}>
            <Text style={styles.emptyHint}>No public reviews yet.</Text>
            <ReviewCard
              author="Preview"
              body="Volunteer feedback will appear here once you start hosting events."
              rating={5}
            />
          </View>
        )}
        {tab === "info" && (
          <View style={styles.tabContent}>
            <InfoRow label="Email" value={user.email} />
            <InfoRow label="OIB" value={user.oib} />
            {user.contactPersonName ? (
              <InfoRow label="Contact" value={user.contactPersonName} />
            ) : null}
            <InfoRow label="Pending events" value={String(pending)} />
          </View>
        )}

        <Pressable style={styles.logoutBtn} onPress={() => void handleLogout()}>
          <Text style={styles.logoutTxt}>Log out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function formatNumber(n: number) {
  return n.toLocaleString("en-US");
}

function OrgEventRow({ event, accent }: { event: OrganizerEventListRow; accent: string }) {
  return (
    <View style={[styles.activityCard, { borderLeftColor: accent }]}>
      <View style={styles.activityTop}>
        <Text style={[styles.activityMeta, { color: accent }]}>
          {event.status.replace("_", " ").toUpperCase()}
        </Text>
      </View>
      <Text style={styles.activityTitle}>{event.title}</Text>
      <Text style={styles.eventDetail}>{event.detailLabel}</Text>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
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
  warnBanner: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    padding: spacing.sm,
    borderRadius: 10,
    backgroundColor: "#fff8e6",
    color: "#856404",
    fontSize: 13,
  },
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
    textAlign: "center",
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
  impactRank: {
    marginTop: 4,
    fontSize: 13,
    color: colors.muted,
    fontWeight: "600",
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
  },
  activityMeta: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  activityTitle: {
    marginTop: spacing.sm,
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
  },
  eventDetail: {
    marginTop: 6,
    fontSize: 14,
    color: colors.muted,
    lineHeight: 20,
  },
  infoRow: {
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    color: colors.muted2,
  },
  infoValue: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
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
