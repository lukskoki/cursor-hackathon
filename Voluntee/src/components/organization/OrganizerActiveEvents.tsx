import {
  View,
  Text,
  ImageBackground,
  Pressable,
  StyleSheet,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import type { ActiveOrganizerEventInProgress } from "@/types/organization/dashboard";

const FALLBACK_HERO =
  "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80";

type OrganizerActiveEventsProps = {
  inProgressEvents: ActiveOrganizerEventInProgress[];
  onPressSeeAll?: () => void;
  onPressNew?: () => void;
};

export function OrganizerActiveEvents({
  inProgressEvents,
  onPressSeeAll,
  onPressNew,
}: OrganizerActiveEventsProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Active Events</Text>
        <View style={styles.headerActions}>
          <Pressable
            onPress={onPressNew}
            hitSlop={8}
            style={({ pressed }) => [styles.newFab, pressed && styles.newFabPressed]}
            accessibilityRole="button"
            accessibilityLabel="Create new event"
          >
            <Ionicons name="add" size={22} color="#fff" />
          </Pressable>
          <Pressable onPress={onPressSeeAll} hitSlop={8}>
            <Text style={styles.seeAll}>SEE ALL</Text>
          </Pressable>
        </View>
      </View>
      {inProgressEvents.length === 0 ? (
        <Text style={styles.empty}>No events in progress right now.</Text>
      ) : (
        inProgressEvents.map((ev) => <InProgressCard key={ev.id} event={ev} />)
      )}
    </View>
  );
}

function InProgressCard({ event }: { event: ActiveOrganizerEventInProgress }) {
  const uri = event.coverImageUrl?.trim() || FALLBACK_HERO;
  const progress = Math.min(1, event.joined / event.capacity);
  return (
    <ImageBackground
      source={{ uri }}
      style={styles.inProgress}
      imageStyle={styles.inProgressImg}
    >
      <View style={styles.inProgressOverlay} />
      <View style={styles.inProgressInner}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>IN PROGRESS</Text>
        </View>
        <View style={styles.inProgressBottom}>
          <Text style={styles.inProgressTitle}>{event.title}</Text>
          <View style={styles.volRow}>
            <Ionicons name="people-outline" size={18} color="rgba(255,255,255,0.95)" />
            <Text style={styles.volText}>
              {event.joined} / {event.capacity} Volunteers joined
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
        </View>
        <Pressable style={styles.chevronBtn} hitSlop={8}>
          <Ionicons name="chevron-forward" size={22} color="#fff" />
        </Pressable>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: spacing.lg },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: colors.navy },
  headerActions: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  newFab: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  newFabPressed: { opacity: 0.88 },
  seeAll: { fontSize: 13, fontWeight: "700", color: colors.primary, letterSpacing: 0.3 },
  empty: { fontSize: 15, color: colors.muted, marginBottom: spacing.md },
  inProgress: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: spacing.md,
    minHeight: 200,
  },
  inProgressImg: { borderRadius: 16 },
  inProgressOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 16,
  },
  inProgressInner: {
    flex: 1,
    padding: spacing.md,
    justifyContent: "space-between",
    minHeight: 200,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "800", letterSpacing: 0.6 },
  inProgressBottom: { flex: 1, justifyContent: "flex-end" },
  inProgressTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: spacing.sm,
  },
  volRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  volText: { color: "rgba(255,255,255,0.95)", fontSize: 14, fontWeight: "600" },
  progressTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.35)",
    marginTop: spacing.md,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: colors.primary, borderRadius: 3 },
  chevronBtn: {
    position: "absolute",
    right: spacing.md,
    bottom: spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
});
