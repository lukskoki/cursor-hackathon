import { useState, useRef, useCallback, useEffect } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Animated, ActivityIndicator } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { VolunteerEvent, EventCategory } from "@/types/volunteer/event";
import { CATEGORY_LABELS } from "@/types/volunteer/event";
import { useApplyToEvent } from "@/hooks/volunteer/events/useApplyToEvent";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const CAT_ICON: Record<EventCategory, IconName> = {
  environment: "leaf",
  social: "people",
  animals: "paw",
  community: "heart",
  education: "book",
};

const CAT_COLOR: Record<EventCategory, string> = {
  environment: "#34C759",
  social: "#AF52DE",
  animals: "#FF9500",
  community: "#FF3B30",
  education: "#208AEF",
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function formatDuration(mins: number) {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}min` : `${h}h`;
}

type Props = {
  event: VolunteerEvent;
  onBack: () => void;
  onApply: (id: string) => void;
};

export function EventDetailView({ event, onBack, onApply }: Props) {
  const [liked, setLiked] = useState(false);
  const { apply, loading: applyLoading, error: applyError, applied, checking } = useApplyToEvent(event.id);
  const btnScale = useRef(new Animated.Value(1)).current;
  const heartScale = useRef(new Animated.Value(1)).current;
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTranslateY = useRef(new Animated.Value(6)).current;

  const toggleLike = useCallback(() => {
    const next = !liked;
    setLiked(next);

    Animated.sequence([
      Animated.timing(heartScale, { toValue: 1.4, duration: 120, useNativeDriver: true }),
      Animated.timing(heartScale, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();

    if (next) {
      toastOpacity.setValue(0);
      toastTranslateY.setValue(6);
      Animated.parallel([
        Animated.timing(toastOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(toastTranslateY, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start(() => {
        setTimeout(() => {
          Animated.timing(toastOpacity, { toValue: 0, duration: 300, useNativeDriver: true }).start();
        }, 1200);
      });
    } else {
      toastOpacity.setValue(0);
    }
  }, [liked, heartScale, toastOpacity, toastTranslateY]);

  const color = CAT_COLOR[event.category];
  const spotsLeft = event.volunteersNeeded - event.volunteersApplied;
  const spotsPct = (event.volunteersApplied / event.volunteersNeeded) * 100;

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroBanner, { backgroundColor: color + "14" }]}>
          <Pressable onPress={onBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#111" />
          </Pressable>
          <View style={[styles.heroIcon, { backgroundColor: color + "22" }]}>
            <Ionicons name={CAT_ICON[event.category]} size={32} color={color} />
          </View>
          <View style={[styles.categoryBadge, { backgroundColor: color + "1A" }]}>
            <Text style={[styles.categoryText, { color }]}>
              {CATEGORY_LABELS[event.category]}
            </Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{event.title}</Text>
            <View style={styles.likeWrap}>
              <Pressable onPress={toggleLike} style={styles.likeBtn}>
                <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                  <Ionicons
                    name={liked ? "heart" : "heart-outline"}
                    size={24}
                    color={liked ? "#FF3B30" : "#999"}
                  />
                </Animated.View>
              </Pressable>
              <Animated.Text
                style={[
                  styles.likeToast,
                  { opacity: toastOpacity, transform: [{ translateY: toastTranslateY }] },
                ]}
              >
                Added to liked
              </Animated.Text>
            </View>
          </View>
          <View style={styles.organizerRow}>
            <Ionicons name="business-outline" size={14} color="#888" />
            <Text style={styles.organizer}>{event.organizerName}</Text>
          </View>

          <View style={styles.infoGrid}>
            <InfoItem icon="calendar-outline" label="Date" value={formatDate(event.startsAt)} />
            <InfoItem icon="time-outline" label="Time" value={formatTime(event.startsAt)} />
            <InfoItem icon="hourglass-outline" label="Duration" value={formatDuration(event.durationMinutes)} />
            <InfoItem icon="location-outline" label="Location" value={event.address} />
            <InfoItem icon="star-outline" label="Points" value={`${event.points} pts`} />
          </View>

          <View style={styles.spotsCard}>
            <View style={styles.spotsHeader}>
              <Text style={styles.spotsLabel}>Volunteer spots</Text>
              <Text style={styles.spotsCount}>
                {event.volunteersApplied}/{event.volunteersNeeded}
              </Text>
            </View>
            <View style={styles.progressBg}>
              <View
                style={[styles.progressFill, { width: `${Math.min(spotsPct, 100)}%` }]}
              />
            </View>
            <Text style={styles.spotsLeftTxt}>
              {spotsLeft > 0
                ? `${spotsLeft} spot${spotsLeft === 1 ? "" : "s"} remaining`
                : "All spots filled"}
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Category & Tags</Text>
          <View style={styles.tagsWrap}>
            <View style={[styles.tag, { backgroundColor: color + "1A" }]}>
              <Ionicons name={CAT_ICON[event.category]} size={13} color={color} />
              <Text style={[styles.tagText, { color }]}>
                {CATEGORY_LABELS[event.category]}
              </Text>
            </View>
            {event.tags.map((t) => (
              <View key={t} style={styles.tag}>
                <Text style={styles.tagText}>{t}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>About this activity</Text>
          <Text style={styles.description}>{event.description}</Text>
        </View>
      </ScrollView>

      <View style={styles.applyWrap}>
        <Animated.View style={{ transform: [{ scale: btnScale }] }}>
          <Pressable
            style={[
              styles.applyBtn,
              applied && styles.applyBtnSuccess,
              spotsLeft <= 0 && !applied && styles.applyBtnDisabled,
            ]}
            disabled={spotsLeft <= 0 || applied || applyLoading || checking}
            onPress={() => {
              Animated.sequence([
                Animated.timing(btnScale, { toValue: 0.92, duration: 100, useNativeDriver: true }),
                Animated.timing(btnScale, { toValue: 1, duration: 150, useNativeDriver: true }),
              ]).start();
              void apply();
            }}
          >
            {applyLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons
                name={applied ? "checkmark-circle" : "hand-left"}
                size={applied ? 22 : 18}
                color="#fff"
              />
            )}
            <Text style={styles.applyText}>
              {applyLoading
                ? "Applying..."
                : applied
                  ? "Successfully Applied!"
                  : spotsLeft > 0
                    ? "Apply to Volunteer"
                    : "Fully Booked"}
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

function InfoItem({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <View style={styles.infoItem}>
      <Ionicons name={icon} size={18} color="#208AEF" />
      <View style={styles.infoText}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 20 },

  heroBanner: {
    alignItems: "center",
    paddingVertical: 24,
    paddingTop: 12,
    gap: 12,
  },
  backBtn: {
    position: "absolute",
    top: 12,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    zIndex: 10,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryBadge: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 12,
  },
  categoryText: { fontSize: 13, fontWeight: "600" },

  body: { paddingHorizontal: 20, paddingTop: 16 },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  title: { fontSize: 22, fontWeight: "700", color: "#111", marginBottom: 6, flex: 1 },
  likeWrap: { alignItems: "center" },
  likeBtn: { paddingTop: 4 },
  likeToast: { fontSize: 11, color: "#FF3B30", fontWeight: "500", marginTop: 2 },
  organizerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 20,
  },
  organizer: { fontSize: 14, color: "#888" },

  infoGrid: { gap: 14, marginBottom: 20 },
  infoItem: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  infoText: { flex: 1 },
  infoLabel: { fontSize: 12, color: "#999", marginBottom: 1 },
  infoValue: { fontSize: 14, color: "#222", fontWeight: "500" },

  spotsCard: {
    backgroundColor: "#F7F8FA",
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  spotsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  spotsLabel: { fontSize: 14, fontWeight: "600", color: "#333" },
  spotsCount: { fontSize: 14, fontWeight: "700", color: "#208AEF" },
  progressBg: {
    height: 7,
    backgroundColor: "#E4E6EA",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressFill: { height: 7, backgroundColor: "#208AEF", borderRadius: 4 },
  spotsLeftTxt: { fontSize: 12, color: "#888" },

  tagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#F2F3F5",
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 10,
  },
  tagText: { fontSize: 12, fontWeight: "500", color: "#555" },

  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#111", marginBottom: 6 },
  description: { fontSize: 14, lineHeight: 21, color: "#444" },

  applyWrap: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 30,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  applyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#208AEF",
    paddingVertical: 14,
    borderRadius: 14,
  },
  applyBtnSuccess: { backgroundColor: "#34C759" },
  applyBtnDisabled: { backgroundColor: "#ccc" },
  applyText: { fontSize: 15, fontWeight: "700", color: "#fff" },
});
