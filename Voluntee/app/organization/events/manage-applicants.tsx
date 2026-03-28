import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
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
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";

import { getFirebaseFirestore } from "@/services/shared/firebaseApp";
import { useEventCompletion } from "@/hooks/organization/events/useEventCompletion";

type Applicant = {
  id: string;
  userId: string;
  userEmail: string;
  status: string;
  appliedAt: string;
};

type FilterTab = "all" | "pending" | "accepted" | "rejected" | "completed";

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "accepted", label: "Accepted" },
  { key: "completed", label: "Completed" },
  { key: "rejected", label: "Rejected" },
];

export default function ManageApplicants() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>("all");
  const { completeVolunteer, completeAll, loading: completing } = useEventCompletion();

  const fetchApplicants = useCallback(async () => {
    if (!id) return;
    const db = getFirebaseFirestore();
    try {
      const q = query(
        collection(db, "applications"),
        where("eventId", "==", id),
      );
      const snap = await getDocs(q);
      setApplicants(
        snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Applicant),
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchApplicants();
  }, [fetchApplicants]);

  const handleUpdateStatus = async (
    applicantId: string,
    status: "accepted" | "rejected",
  ) => {
    try {
      const db = getFirebaseFirestore();
      await updateDoc(doc(db, "applications", applicantId), { status });
      setApplicants((prev) =>
        prev.map((a) => (a.id === applicantId ? { ...a, status } : a)),
      );
    } catch {
      Alert.alert("Error", "Failed to update applicant status.");
    }
  };

  const handleCompleteVolunteer = (applicant: Applicant) => {
    if (!id) return;
    Alert.alert(
      "Mark Complete",
      `Award points and mark ${applicant.userEmail} as completed?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Complete",
          onPress: async () => {
            try {
              await completeVolunteer(applicant.id, id, applicant.userId);
              setApplicants((prev) =>
                prev.map((a) =>
                  a.id === applicant.id ? { ...a, status: "completed" } : a,
                ),
              );
            } catch {
              Alert.alert("Error", "Failed to mark volunteer as completed.");
            }
          },
        },
      ],
    );
  };

  const handleCompleteAll = () => {
    if (!id) return;
    const acceptedCount = applicants.filter((a) => a.status === "accepted").length;
    if (acceptedCount === 0) {
      Alert.alert("No Volunteers", "There are no accepted volunteers to complete.");
      return;
    }
    Alert.alert(
      "Complete All",
      `Mark all ${acceptedCount} accepted volunteer${acceptedCount === 1 ? "" : "s"} as completed and award points?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Complete All",
          onPress: async () => {
            try {
              const count = await completeAll(id);
              setApplicants((prev) =>
                prev.map((a) =>
                  a.status === "accepted" ? { ...a, status: "completed" } : a,
                ),
              );
              Alert.alert("Done", `${count} volunteer${count === 1 ? "" : "s"} marked as completed.`);
            } catch {
              Alert.alert("Error", "Failed to complete volunteers.");
            }
          },
        },
      ],
    );
  };

  const filtered =
    filter === "all"
      ? applicants
      : applicants.filter((a) => a.status === filter);

  const counts = {
    all: applicants.length,
    pending: applicants.filter((a) => a.status === "pending").length,
    accepted: applicants.filter((a) => a.status === "accepted").length,
    completed: applicants.filter((a) => a.status === "completed").length,
    rejected: applicants.filter((a) => a.status === "rejected").length,
  };

  return (
    <View style={styles.root}>
      <SafeAreaView edges={["top"]} style={styles.headerSafe}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#111" />
          </Pressable>
          <Text style={styles.headerTitle}>Manage Applicants</Text>
          <View style={styles.backBtn} />
        </View>
      </SafeAreaView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {FILTER_TABS.map((tab) => {
          const active = filter === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setFilter(tab.key)}
              style={[styles.filterChip, active && styles.filterChipActive]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  active && styles.filterChipTextActive,
                ]}
              >
                {tab.label} ({counts[tab.key]})
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {counts.accepted > 0 && (
        <View style={styles.completeAllRow}>
          <Pressable
            style={[styles.completeAllBtn, completing && { opacity: 0.6 }]}
            onPress={handleCompleteAll}
            disabled={completing}
          >
            {completing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="checkmark-done" size={18} color="#fff" />
            )}
            <Text style={styles.completeAllText}>
              Complete All Accepted ({counts.accepted})
            </Text>
          </Pressable>
        </View>
      )}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#208AEF" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color="#ddd" />
              <Text style={styles.emptyText}>
                {filter === "all"
                  ? "No applications yet"
                  : `No ${filter} applications`}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <ApplicantCard
              applicant={item}
              onAccept={() => handleUpdateStatus(item.id, "accepted")}
              onReject={() => handleUpdateStatus(item.id, "rejected")}
              onComplete={() => handleCompleteVolunteer(item)}
            />
          )}
        />
      )}
    </View>
  );
}

function ApplicantCard({
  applicant,
  onAccept,
  onReject,
  onComplete,
}: {
  applicant: Applicant;
  onAccept: () => void;
  onReject: () => void;
  onComplete: () => void;
}) {
  const statusColor =
    applicant.status === "completed"
      ? "#34C759"
      : applicant.status === "accepted"
        ? "#208AEF"
        : applicant.status === "rejected"
          ? "#FF3B30"
          : "#FF9500";

  const initials = applicant.userEmail.substring(0, 2).toUpperCase();
  const appliedDate = applicant.appliedAt
    ? new Date(applicant.appliedAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  return (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.email} numberOfLines={1}>
            {applicant.userEmail}
          </Text>
          {appliedDate ? (
            <Text style={styles.appliedDate}>Applied {appliedDate}</Text>
          ) : null}
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusColor + "18" },
            ]}
          >
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {applicant.status.charAt(0).toUpperCase() +
                applicant.status.slice(1)}
            </Text>
          </View>
        </View>
      </View>

      {applicant.status === "pending" && (
        <View style={styles.actions}>
          <Pressable onPress={onAccept} style={styles.acceptBtn}>
            <Ionicons name="checkmark" size={20} color="#fff" />
            <Text style={styles.actionBtnText}>Accept</Text>
          </Pressable>
          <Pressable onPress={onReject} style={styles.rejectBtn}>
            <Ionicons name="close" size={20} color="#fff" />
            <Text style={styles.actionBtnText}>Reject</Text>
          </Pressable>
        </View>
      )}
      {applicant.status === "accepted" && (
        <View style={styles.actions}>
          <Pressable onPress={onComplete} style={styles.completeSingleBtn}>
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.actionBtnText}>Mark Complete</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

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

  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#F2F3F5",
  },
  filterChipActive: { backgroundColor: "#208AEF" },
  filterChipText: { fontSize: 13, fontWeight: "600", color: "#555" },
  filterChipTextActive: { color: "#fff" },

  listContent: { paddingHorizontal: 20, paddingBottom: 24, gap: 10 },

  emptyState: {
    alignItems: "center",
    paddingTop: 60,
    gap: 12,
  },
  emptyText: { fontSize: 15, color: "#aaa" },

  card: {
    backgroundColor: "#F7F8FA",
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  cardLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#E4E6EA",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontSize: 15, fontWeight: "700", color: "#6b7280" },
  cardInfo: { flex: 1, minWidth: 0, gap: 4 },
  email: { fontSize: 15, fontWeight: "600", color: "#222" },
  appliedDate: { fontSize: 12, color: "#999" },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 2,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: "600" },

  actions: { flexDirection: "row", gap: 10, marginTop: 2 },
  acceptBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#34C759",
    paddingVertical: 12,
    borderRadius: 12,
  },
  rejectBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#FF3B30",
    paddingVertical: 12,
    borderRadius: 12,
  },
  actionBtnText: { fontSize: 14, fontWeight: "600", color: "#fff" },

  completeSingleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#34C759",
    paddingVertical: 12,
    borderRadius: 12,
  },
  completeAllRow: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  completeAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#34C759",
    paddingVertical: 12,
    borderRadius: 12,
  },
  completeAllText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
});
