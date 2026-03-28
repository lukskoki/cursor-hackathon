import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

import { getFirebaseFirestore } from "@/services/shared/firebaseApp";
import type { VolunteerEvent, EventCategory } from "@/types/volunteer/event";
import { CATEGORY_LABELS } from "@/types/volunteer/event";

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

type Applicant = {
  id: string;
  userId: string;
  userEmail: string;
  status: string;
  appliedAt: string;
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

export default function OrganizationEventDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [event, setEvent] = useState<VolunteerEvent | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    if (!id) return;
    const db = getFirebaseFirestore();
    try {
      const eventSnap = await getDoc(doc(db, "events", id));
      if (eventSnap.exists()) {
        setEvent({ id: eventSnap.id, ...eventSnap.data() } as VolunteerEvent);
      }

      const q = query(
        collection(db, "applications"),
        where("eventId", "==", id),
      );
      const appSnap = await getDocs(q);
      setApplicants(
        appSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Applicant),
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateApplicant = async (
    applicantId: string,
    status: "accepted" | "rejected",
  ) => {
    const db = getFirebaseFirestore();
    await updateDoc(doc(db, "applications", applicantId), { status });
    setApplicants((prev) =>
      prev.map((a) => (a.id === applicantId ? { ...a, status } : a)),
    );
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Event",
      "Are you sure you want to delete this event? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (!id) return;
            setDeleting(true);
            try {
              const db = getFirebaseFirestore();
              await deleteDoc(doc(db, "events", id));
              router.back();
            } catch {
              Alert.alert("Error", "Failed to delete event.");
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

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

  const color = CAT_COLOR[event.category] ?? "#208AEF";
  const spotsLeft = event.volunteersNeeded - event.volunteersApplied;
  const spotsPct =
    event.volunteersNeeded > 0
      ? (event.volunteersApplied / event.volunteersNeeded) * 100
      : 0;

  const pendingApplicants = applicants.filter((a) => a.status === "pending");
  const decidedApplicants = applicants.filter((a) => a.status !== "pending");

  return (
    <View style={styles.root}>
      <SafeAreaView edges={["top"]} style={styles.headerSafe}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#111" />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>
            Event Details
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
            <Ionicons
              name={CAT_ICON[event.category] ?? "calendar"}
              size={36}
              color={color}
            />
          </View>
          <View style={[styles.categoryBadge, { backgroundColor: color + "1A" }]}>
            <Text style={[styles.categoryText, { color }]}>
              {CATEGORY_LABELS[event.category] ?? event.category}
            </Text>
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.title}>{event.title}</Text>
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

          {event.tags.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Tags</Text>
              <View style={styles.tagsWrap}>
                {event.tags.map((t) => (
                  <View key={t} style={styles.tag}>
                    <Text style={styles.tagText}>{t}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          <Text style={styles.sectionTitle}>About this event</Text>
          <Text style={styles.description}>{event.description}</Text>

          <View style={styles.applicantsSection}>
            <View style={styles.applicantsHeaderRow}>
              <Text style={styles.sectionTitle}>
                Applicants ({applicants.length})
              </Text>
              {applicants.length > 3 && (
                <Pressable
                  onPress={() =>
                    router.push(
                      `/organization/events/manage-applicants?id=${id}`,
                    )
                  }
                >
                  <Text style={styles.viewAllLink}>View all</Text>
                </Pressable>
              )}
            </View>

            {applicants.length === 0 ? (
              <View style={styles.emptyApplicants}>
                <Ionicons name="people-outline" size={32} color="#ccc" />
                <Text style={styles.emptyApplicantsText}>
                  No applications yet
                </Text>
              </View>
            ) : (
              <>
                {pendingApplicants.length > 0 && (
                  <Text style={styles.subSectionLabel}>
                    Pending ({pendingApplicants.length})
                  </Text>
                )}
                {pendingApplicants.slice(0, 3).map((a) => (
                  <ApplicantRow
                    key={a.id}
                    applicant={a}
                    onAccept={() => handleUpdateApplicant(a.id, "accepted")}
                    onReject={() => handleUpdateApplicant(a.id, "rejected")}
                  />
                ))}

                {decidedApplicants.length > 0 && (
                  <Text style={styles.subSectionLabel}>
                    Decided ({decidedApplicants.length})
                  </Text>
                )}
                {decidedApplicants.slice(0, 3).map((a) => (
                  <ApplicantRow key={a.id} applicant={a} />
                ))}
              </>
            )}
          </View>
        </View>
      </ScrollView>

      <SafeAreaView edges={["bottom"]} style={styles.bottomBar}>
        <View style={styles.actionRow}>
          <Pressable
            style={styles.editBtn}
            onPress={() =>
              router.push(`/organization/events/edit?id=${id}`)
            }
          >
            <Ionicons name="create-outline" size={20} color="#fff" />
            <Text style={styles.editBtnText}>Edit Event</Text>
          </Pressable>
          <Pressable
            style={styles.deleteBtn}
            onPress={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <ActivityIndicator size="small" color="#FF3B30" />
            ) : (
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
            )}
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

function ApplicantRow({
  applicant,
  onAccept,
  onReject,
}: {
  applicant: Applicant;
  onAccept?: () => void;
  onReject?: () => void;
}) {
  const statusColor =
    applicant.status === "accepted"
      ? "#34C759"
      : applicant.status === "rejected"
        ? "#FF3B30"
        : "#FF9500";
  const initials = applicant.userEmail
    .substring(0, 2)
    .toUpperCase();

  return (
    <View style={styles.applicantCard}>
      <View style={styles.applicantAvatar}>
        <Text style={styles.applicantAvatarText}>{initials}</Text>
      </View>
      <View style={styles.applicantInfo}>
        <Text style={styles.applicantEmail} numberOfLines={1}>
          {applicant.userEmail}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + "18" }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {applicant.status.charAt(0).toUpperCase() +
              applicant.status.slice(1)}
          </Text>
        </View>
      </View>
      {applicant.status === "pending" && onAccept && onReject && (
        <View style={styles.applicantActions}>
          <Pressable onPress={onAccept} style={styles.acceptBtn}>
            <Ionicons name="checkmark" size={18} color="#fff" />
          </Pressable>
          <Pressable onPress={onReject} style={styles.rejectBtn}>
            <Ionicons name="close" size={18} color="#fff" />
          </Pressable>
        </View>
      )}
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

  heroBanner: { alignItems: "center", paddingVertical: 32, gap: 14 },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryText: { fontSize: 13, fontWeight: "600" },

  body: { paddingHorizontal: 20, paddingTop: 20 },
  title: { fontSize: 24, fontWeight: "700", color: "#111", marginBottom: 6 },
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
  progressFill: { height: 8, backgroundColor: "#208AEF", borderRadius: 4 },
  spotsLeft: { fontSize: 12, color: "#888" },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111",
    marginBottom: 8,
  },
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
  description: { fontSize: 15, lineHeight: 22, color: "#444", marginBottom: 24 },

  applicantsSection: { marginBottom: 8 },
  applicantsHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  viewAllLink: { fontSize: 14, fontWeight: "600", color: "#208AEF" },
  subSectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#999",
    marginTop: 12,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  emptyApplicants: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 8,
  },
  emptyApplicantsText: { fontSize: 14, color: "#aaa" },

  applicantCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F8FA",
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  applicantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#E4E6EA",
    justifyContent: "center",
    alignItems: "center",
  },
  applicantAvatarText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6b7280",
  },
  applicantInfo: { flex: 1, minWidth: 0, gap: 4 },
  applicantEmail: { fontSize: 14, fontWeight: "500", color: "#222" },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: "600" },
  applicantActions: { flexDirection: "row", gap: 8 },
  acceptBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#34C759",
    justifyContent: "center",
    alignItems: "center",
  },
  rejectBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
  },

  bottomBar: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  actionRow: { flexDirection: "row", gap: 12 },
  editBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#208AEF",
    paddingVertical: 16,
    borderRadius: 16,
  },
  editBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },
  deleteBtn: {
    width: 56,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF0F0",
    borderRadius: 16,
  },
});
