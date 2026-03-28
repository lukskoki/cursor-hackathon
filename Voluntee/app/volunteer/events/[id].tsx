import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

import type { VolunteerEvent, EventCategory } from "@/types/volunteer/event";
import { CATEGORY_LABELS } from "@/types/volunteer/event";
import { volunteerMapService } from "@/services/volunteer/map/volunteerMapService";
import { useVolunteerAppliedStore } from "@/store/volunteerAppliedStore";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const CAT_ICON: Record<EventCategory, IconName> = {
  environment: "leaf-outline",
  social: "people-outline",
  animals: "paw-outline",
  community: "heart-outline",
  education: "book-outline",
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

export default function VolunteerEventDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [event, setEvent] = useState<VolunteerEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [favorite, setFavorite] = useState(false);
  const [appliedToastVisible, setAppliedToastVisible] = useState(false);
  const markApplied = useVolunteerAppliedStore((s) => s.markApplied);
  const userHasApplied = useVolunteerAppliedStore(
    (s) => !!(id && s.appliedIds[id]),
  );

  useEffect(() => {
    setAppliedToastVisible(false);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    volunteerMapService.getById(id).then((e) => {
      setEvent(e);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (!appliedToastVisible) return;
    const t = setTimeout(() => {
      setAppliedToastVisible(false);
      if (id) markApplied(id);
    }, 2200);
    return () => clearTimeout(t);
  }, [appliedToastVisible, id, markApplied]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#208AEF" />
      </View>
    );
  }

  if (!event) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.notFound}>Event not found</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backLink}>Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const color = CAT_COLOR[event.category];
  const spotsLeft = event.volunteersNeeded - event.volunteersApplied;
  const spotsPct = (event.volunteersApplied / event.volunteersNeeded) * 100;
  const isFullyBooked = spotsLeft <= 0;
  const applyDisabled = isFullyBooked || userHasApplied;

  return (
    <View style={styles.root}>
      <SafeAreaView edges={["top"]} style={styles.headerSafe}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#111" />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>
            Activity Details
          </Text>
          <View style={styles.backBtn} />
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroBanner, { backgroundColor: color + "14" }]}>
          <View style={[styles.heroIcon, { backgroundColor: color + "22" }]}>
            <Ionicons name={CAT_ICON[event.category]} size={40} color={color} />
          </View>
          <View style={[styles.categoryBadge, { backgroundColor: color + "1A" }]}>
            <Ionicons name={CAT_ICON[event.category]} size={17} color={color} />
            <Text style={[styles.categoryText, { color }]}>
              {CATEGORY_LABELS[event.category]}
            </Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{event.title}</Text>
            <Pressable
              onPress={() => setFavorite((f) => !f)}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel={favorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Ionicons
                name={favorite ? "heart" : "heart-outline"}
                size={26}
                color={favorite ? "#FF3B30" : "#bbb"}
              />
            </Pressable>
          </View>
          <View style={styles.organizerRow}>
            <Ionicons name="business-outline" size={14} color="#888" />
            <Text style={styles.organizer}>{event.organizerName}</Text>
          </View>

          <View style={styles.infoGrid}>
            <InfoItem
              icon="calendar-outline"
              label="Date"
              value={formatDate(event.startsAt)}
            />
            <InfoItem
              icon="time-outline"
              label="Time"
              value={formatTime(event.startsAt)}
            />
            <InfoItem
              icon="hourglass-outline"
              label="Duration"
              value={formatDuration(event.durationMinutes)}
            />
            <InfoItem
              icon="location-outline"
              label="Location"
              value={event.address}
            />
            <InfoItem
              icon="star-outline"
              label="Points"
              value={`${event.points} pts`}
            />
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
                style={[
                  styles.progressFill,
                  { width: `${Math.min(spotsPct, 100)}%` },
                ]}
              />
            </View>
            <Text style={styles.spotsLeft}>
              {spotsLeft > 0
                ? `${spotsLeft} spot${spotsLeft === 1 ? "" : "s"} remaining`
                : "All spots filled"}
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Category & Tags</Text>
          <View style={styles.tagsWrap}>
            <View style={[styles.tag, { backgroundColor: color + "1A" }]}>
              <Ionicons name={CAT_ICON[event.category]} size={15} color={color} />
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

      <SafeAreaView edges={["bottom"]} style={styles.bottomBar}>
        <Pressable
          style={[
            styles.applyBtn,
            isFullyBooked && !userHasApplied && styles.applyBtnDisabled,
            userHasApplied && { backgroundColor: color },
          ]}
          disabled={applyDisabled}
          onPress={() => {
            if (appliedToastVisible) return;
            setAppliedToastVisible(true);
          }}
        >
          <Ionicons
            name={userHasApplied ? "checkmark" : "hand-left"}
            size={20}
            color="#fff"
          />
          <Text style={styles.applyText}>
            {userHasApplied
              ? "Applied"
              : isFullyBooked
                ? "Fully Booked"
                : "Apply to Volunteer"}
          </Text>
        </Pressable>
      </SafeAreaView>

      {appliedToastVisible ? (
        <View style={styles.toastOverlay} pointerEvents="none">
          <View style={styles.toastCard}>
            <View style={styles.toastCheckCircle}>
              <Ionicons name="checkmark" size={28} color="#fff" />
            </View>
            <Text style={styles.toastText}>Applied successfully</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: IconName;
  label: string;
  value: string;
}) {
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
  root: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  notFound: { fontSize: 17, color: "#666", marginBottom: 12 },
  backLink: { fontSize: 15, color: "#208AEF", fontWeight: "600" },

  headerSafe: { backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "600",
    color: "#111",
  },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 20 },

  heroBanner: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 14,
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  categoryText: { fontSize: 13, fontWeight: "600" },

  body: { paddingHorizontal: 20, paddingTop: 20 },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 6,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: "700",
    color: "#111",
    lineHeight: 30,
  },
  organizerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 24,
  },
  organizer: { fontSize: 14, color: "#888" },

  infoGrid: { gap: 16, marginBottom: 24 },
  infoItem: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  infoText: { flex: 1 },
  infoLabel: { fontSize: 12, color: "#999", marginBottom: 1 },
  infoValue: { fontSize: 15, color: "#222", fontWeight: "500" },

  spotsCard: {
    backgroundColor: "#F7F8FA",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  spotsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  spotsLabel: { fontSize: 14, fontWeight: "600", color: "#333" },
  spotsCount: { fontSize: 14, fontWeight: "700", color: "#208AEF" },
  progressBg: {
    height: 8,
    backgroundColor: "#E4E6EA",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: 8,
    backgroundColor: "#208AEF",
    borderRadius: 4,
  },
  spotsLeft: { fontSize: 12, color: "#888" },

  tagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 24,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#F2F3F5",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  tagText: { fontSize: 13, fontWeight: "500", color: "#555" },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111",
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: "#444",
  },

  bottomBar: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  applyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#208AEF",
    paddingVertical: 16,
    borderRadius: 16,
  },
  applyBtnDisabled: { backgroundColor: "#ccc" },
  applyText: { fontSize: 16, fontWeight: "700", color: "#fff" },

  toastOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  toastCard: {
    alignItems: "center",
    paddingHorizontal: 28,
    paddingVertical: 22,
    borderRadius: 16,
    backgroundColor: "#fff",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  toastCheckCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#208AEF",
    alignItems: "center",
    justifyContent: "center",
  },
  toastText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    textAlign: "center",
  },
});
