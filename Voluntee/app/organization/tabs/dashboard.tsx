import { useState } from "react";
import { ScrollView, View, Text, StyleSheet, Pressable } from "react-native";
import { ScreenWrapper } from "@/components/shared/ScreenWrapper";
import { Loader } from "@/components/shared/Loader";
import { OrganizerDashboardHeader } from "@/components/organization/OrganizerDashboardHeader";
import { OrganizerStatsBlock } from "@/components/organization/OrganizerStatsBlock";
import { OrganizerActiveEvents } from "@/components/organization/OrganizerActiveEvents";
import { OrganizationEventsModal } from "@/components/organization/OrganizationEventsModal";
import { OrganizationCreateEventModal } from "@/components/organization/OrganizationCreateEventModal";
import { useSharedOrganizationDashboard } from "@/contexts/OrganizationDashboardContext";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import type { ActiveOrganizerEventInProgress } from "@/types/organization/dashboard";

export default function OrganizationDashboard() {
  const [eventsModalOpen, setEventsModalOpen] = useState(false);
  const [createEventOpen, setCreateEventOpen] = useState(false);
  const { data, loading, error, refetch } = useSharedOrganizationDashboard();

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

  const inProgressEvents = data.activeEvents.filter(
    (e): e is ActiveOrganizerEventInProgress => e.kind === "in_progress",
  );

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
        />
        <OrganizerStatsBlock stats={data.stats} />
        <OrganizerActiveEvents
          inProgressEvents={inProgressEvents}
          onPressSeeAll={() => setEventsModalOpen(true)}
          onPressNew={() => setCreateEventOpen(true)}
        />
      </ScrollView>
      <OrganizationEventsModal
        visible={eventsModalOpen}
        onClose={() => setEventsModalOpen(false)}
        events={data.allEvents}
      />
      <OrganizationCreateEventModal
        visible={createEventOpen}
        onClose={() => setCreateEventOpen(false)}
        organizationName={data.organizationName}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: "#FAFBFC" },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
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
