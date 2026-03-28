import { ScrollView, View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { ScreenWrapper } from "@/components/shared/ScreenWrapper";
import { Loader } from "@/components/shared/Loader";
import { OrganizerDashboardHeader } from "@/components/organization/OrganizerDashboardHeader";
import { OrganizerStatsBlock } from "@/components/organization/OrganizerStatsBlock";
import { ApplicantCard } from "@/components/organization/ApplicantCard";
import { OrganizerActiveEvents } from "@/components/organization/OrganizerActiveEvents";
import { useOrganizationDashboard } from "@/hooks/organization/dashboard/useOrganizationDashboard";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

const IN_PROGRESS_IMAGE = require("../../../assets/images/jarun-cleanup.png");

export default function OrganizationDashboard() {
  const router = useRouter();
  const { data, loading, error, refetch, approveApplication, rejectApplication } =
    useOrganizationDashboard();

  if (loading && !data) {
    return (
      <ScreenWrapper style={styles.screen}>
        <Loader />
      </ScreenWrapper>
    );
  }

  if (error && !data) {
    return (
      <ScreenWrapper style={styles.screen}>
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>Dashboard unavailable</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryBtn} onPress={() => void refetch()}>
            <Text style={styles.retryLabel}>Try again</Text>
          </Pressable>
        </View>
      </ScreenWrapper>
    );
  }

  if (!data) {
    return (
      <ScreenWrapper style={styles.screen}>
        <Loader />
      </ScreenWrapper>
    );
  }

  const newCount = data.applications.length;

  return (
    <ScreenWrapper style={styles.screen}>
      {error ? (
        <View style={styles.inlineError}>
          <Text style={styles.inlineErrorText}>{error}</Text>
          <Pressable onPress={() => void refetch()}>
            <Text style={styles.inlineRetry}>Dismiss / retry</Text>
          </Pressable>
        </View>
      ) : null}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <OrganizerDashboardHeader
          organizationName={data.organizationName}
          subtitle={data.locationSubtitle}
          onPressNotifications={() => router.push("/organization/tabs/notifications")}
        />
        <OrganizerStatsBlock stats={data.stats} />
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>New Applications</Text>
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>
              {newCount} NEW
            </Text>
          </View>
        </View>
        {data.applications.map((app) => (
          <ApplicantCard
            key={app.id}
            name={app.name}
            eventName={app.eventName}
            appliedAtLabel={app.appliedAtLabel}
            avatarUrl={app.avatarUrl}
            onApprove={() => void approveApplication(app.id)}
            onReject={() => void rejectApplication(app.id)}
          />
        ))}
        <OrganizerActiveEvents
          events={data.activeEvents}
          inProgressImage={IN_PROGRESS_IMAGE}
          onPressSeeAll={() => router.push("/organization/tabs/events")}
        />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.background },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: colors.navy },
  newBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  newBadgeText: { fontSize: 12, fontWeight: "700", color: "#fff", letterSpacing: 0.3 },
  errorBox: { flex: 1, justifyContent: "center", padding: spacing.lg },
  errorTitle: { fontSize: 18, fontWeight: "700", color: colors.navy, marginBottom: spacing.sm },
  errorText: { fontSize: 15, color: colors.muted, lineHeight: 22 },
  retryBtn: {
    marginTop: spacing.lg,
    alignSelf: "flex-start",
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  retryLabel: { color: "#fff", fontWeight: "600", fontSize: 15 },
  inlineError: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    padding: spacing.md,
    backgroundColor: "#fff3cd",
    borderRadius: 12,
  },
  inlineErrorText: { color: "#664d03", fontSize: 14 },
  inlineRetry: { marginTop: spacing.sm, color: colors.primary, fontWeight: "600", fontSize: 14 },
});
