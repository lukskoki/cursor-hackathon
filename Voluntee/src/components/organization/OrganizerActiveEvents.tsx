import {
  View,
  Text,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  type ImageSourcePropType,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import type { ActiveOrganizerEvent } from "@/types/organization/dashboard";

type OrganizerActiveEventsProps = {
  events: ActiveOrganizerEvent[];
  inProgressImage: ImageSourcePropType;
  onPressSeeAll?: () => void;
};

export function OrganizerActiveEvents({
  events,
  inProgressImage,
  onPressSeeAll,
}: OrganizerActiveEventsProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Active Events</Text>
        <Pressable onPress={onPressSeeAll} hitSlop={8}>
          <Text style={styles.seeAll}>SEE ALL</Text>
        </Pressable>
      </View>
      {events.map((ev) =>
        ev.kind === "in_progress" ? (
          <InProgressCard key={ev.id} event={ev} fallbackImage={inProgressImage} />
        ) : (
          <UpcomingCard key={ev.id} event={ev} />
        ),
      )}
    </View>
  );
}

function InProgressCard({
  event,
  fallbackImage,
}: {
  event: Extract<ActiveOrganizerEvent, { kind: "in_progress" }>;
  fallbackImage: ImageSourcePropType;
}) {
  const progress = Math.min(1, event.joined / event.capacity);
  const source =
    event.coverImageUrl && event.coverImageUrl.length > 0
      ? { uri: event.coverImageUrl }
      : fallbackImage;
  return (
    <ImageBackground source={source} style={styles.inProgress} imageStyle={styles.inProgressImg}>
      <View style={styles.inProgressOverlay} />
      <View style={styles.inProgressInner}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>IN PROGRESS</Text>
        </View>
        <View style={styles.inProgressBottom}>
          <Text style={styles.inProgressTitle}>{event.title}</Text>
          <View style={styles.volRow}>
            <Ionicons name="people-outline" size={18} color="rgba(255,255,255,0.9)" />
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

function UpcomingCard({ event }: { event: Extract<ActiveOrganizerEvent, { kind: "upcoming" }> }) {
  return (
    <View style={styles.upcoming}>
      <View style={styles.thumb}>
        <Text style={styles.thumbEmoji}>🍎</Text>
      </View>
      <View style={styles.upcomingBody}>
        <Text style={styles.upcomingTitle}>{event.title}</Text>
        <Text style={styles.upcomingSub}>{event.startsInLabel}</Text>
        <View style={styles.avatarRow}>
          {event.participantAvatarUrls.slice(0, 3).map((uri, i) => (
            <Image
              key={uri + i}
              source={{ uri }}
              style={[styles.smallAvatar, { marginLeft: i > 0 ? -10 : 0 }]}
            />
          ))}
          <Text style={styles.plusSigned}>+{event.signedUpExtra} signed up</Text>
        </View>
      </View>
      <Pressable hitSlop={12} style={styles.menuBtn}>
        <Ionicons name="ellipsis-vertical" size={20} color={colors.muted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: spacing.lg },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: colors.navy },
  seeAll: { fontSize: 13, fontWeight: "700", color: colors.primary, letterSpacing: 0.5 },
  inProgress: {
    width: "100%",
    borderRadius: 22,
    overflow: "hidden",
    marginBottom: spacing.md,
    minHeight: 200,
  },
  inProgressImg: { borderRadius: 22 },
  inProgressOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(8, 25, 45, 0.72)",
    borderRadius: 22,
  },
  inProgressInner: {
    padding: spacing.lg,
    minHeight: 200,
    justifyContent: "space-between",
    position: "relative",
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  badgeText: { fontSize: 10, fontWeight: "800", color: "#fff", letterSpacing: 0.6 },
  inProgressBottom: { paddingRight: 52 },
  inProgressTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginBottom: spacing.sm,
    maxWidth: "78%",
  },
  volRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: spacing.sm },
  volText: { fontSize: 14, color: "rgba(255,255,255,0.92)" },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.25)",
    overflow: "hidden",
    maxWidth: "85%",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  chevronBtn: {
    position: "absolute",
    right: spacing.md,
    bottom: spacing.lg,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  upcoming: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: "#fde8dc",
    alignItems: "center",
    justifyContent: "center",
  },
  thumbEmoji: { fontSize: 26 },
  upcomingBody: { flex: 1, marginLeft: spacing.md },
  upcomingTitle: { fontSize: 16, fontWeight: "700", color: colors.navy },
  upcomingSub: { marginTop: 4, fontSize: 14, color: colors.captionGray },
  avatarRow: { flexDirection: "row", alignItems: "center", marginTop: spacing.sm },
  smallAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.background,
    backgroundColor: colors.border,
  },
  plusSigned: { marginLeft: spacing.sm, fontSize: 13, color: colors.muted, fontWeight: "500" },
  menuBtn: { padding: spacing.xs },
});
