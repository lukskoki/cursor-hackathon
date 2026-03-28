import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
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
import { useEventCompletion } from "@/hooks/organization/events/useEventCompletion";
import { useAuthStore } from "@/store/authStore";
import { useSubmitReview } from "@/hooks/shared/useReviews";
import { reviewService } from "@/services/shared/reviewService";
import { StarRating } from "@/components/shared/StarRating";
import type { VolunteerEvent, EventCategory } from "@/types/volunteer/event";
import { CATEGORY_LABELS } from "@/types/volunteer/event";
import type { Review } from "@/types/shared/review";

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
  const user = useAuthStore((s) => s.user);
  const [event, setEvent] = useState<VolunteerEvent | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const { completeVolunteer, completeAll, loading: completing } = useEventCompletion();

  const { submit: submitReview, loading: submittingReview } = useSubmitReview();
  const [reviewTarget, setReviewTarget] = useState<Applicant | null>(null);
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());
  const [reviewReliability, setReviewReliability] = useState(0);
  const [reviewCommunication, setReviewCommunication] = useState(0);
  const [reviewEffort, setReviewEffort] = useState(0);
  const [reviewComment, setReviewComment] = useState("");

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

  useEffect(() => {
    if (!id || !user) return;
    let cancelled = false;
    (async () => {
      const checked = new Set<string>();
      for (const a of applicants.filter((x) => x.status === "accepted")) {
        const done = await reviewService.hasReviewed(id, user.id + ":" + a.userId);
        if (!cancelled && done) checked.add(a.userId);
      }
      if (!cancelled) setReviewedIds(checked);
    })();
    return () => { cancelled = true; };
  }, [id, user, applicants]);

  const openReviewModal = (applicant: Applicant) => {
    setReviewTarget(applicant);
    setReviewReliability(0);
    setReviewCommunication(0);
    setReviewEffort(0);
    setReviewComment("");
  };

  const handleSubmitReview = async () => {
    if (!reviewTarget || !user || !id || !event) return;
    const overallRating = Math.round(
      (reviewReliability + reviewCommunication + reviewEffort) / 3,
    );
    if (overallRating === 0) {
      Alert.alert("Rating Required", "Please rate at least one category.");
      return;
    }

    const reviewerName =
      user.role === "organization" ? user.organizationName : user.email;

    const review: Omit<Review, "id"> = {
      eventId: id,
      reviewerId: user.id + ":" + reviewTarget.userId,
      reviewerName,
      reviewerRole: "organization",
      targetId: reviewTarget.userId,
      targetName: reviewTarget.userEmail,
      rating: overallRating,
      comment: reviewComment.trim(),
      createdAt: new Date().toISOString(),
      reliability: reviewReliability,
      communication: reviewCommunication,
      effort: reviewEffort,
    };

    const result = await submitReview(review);
    if (result) {
      setReviewedIds((prev) => new Set(prev).add(reviewTarget.userId));
      setReviewTarget(null);
      Alert.alert("Review Submitted", "Thank you for your feedback.");
    }
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
  const acceptedApplicants = applicants.filter((a) => a.status === "accepted");
  const completedApplicants = applicants.filter((a) => a.status === "completed");
  const rejectedApplicants = applicants.filter((a) => a.status === "rejected");

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
                {acceptedApplicants.length > 0 && (
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
                      Complete All ({acceptedApplicants.length})
                    </Text>
                  </Pressable>
                )}

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

                {acceptedApplicants.length > 0 && (
                  <Text style={styles.subSectionLabel}>
                    Accepted ({acceptedApplicants.length})
                  </Text>
                )}
                {acceptedApplicants.slice(0, 3).map((a) => (
                  <ApplicantRow
                    key={a.id}
                    applicant={a}
                    onComplete={() => handleCompleteVolunteer(a)}
                    onReview={
                      reviewedIds.has(a.userId)
                        ? undefined
                        : () => openReviewModal(a)
                    }
                    hasReview={reviewedIds.has(a.userId)}
                  />
                ))}

                {completedApplicants.length > 0 && (
                  <Text style={styles.subSectionLabel}>
                    Completed ({completedApplicants.length})
                  </Text>
                )}
                {completedApplicants.slice(0, 3).map((a) => (
                  <ApplicantRow key={a.id} applicant={a} />
                ))}

                {rejectedApplicants.length > 0 && (
                  <Text style={styles.subSectionLabel}>
                    Rejected ({rejectedApplicants.length})
                  </Text>
                )}
                {rejectedApplicants.slice(0, 3).map((a) => (
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

      <Modal
        visible={reviewTarget !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setReviewTarget(null)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Review Volunteer</Text>
              <Pressable
                onPress={() => setReviewTarget(null)}
                hitSlop={10}
              >
                <Ionicons name="close" size={24} color="#666" />
              </Pressable>
            </View>
            <Text style={styles.modalSubtitle}>
              {reviewTarget?.userEmail}
            </Text>

            <ScrollView
              style={styles.modalScroll}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.ratingLabel}>Reliability</Text>
              <StarRating
                rating={reviewReliability}
                size={28}
                interactive
                onRate={setReviewReliability}
              />

              <Text style={styles.ratingLabel}>Communication</Text>
              <StarRating
                rating={reviewCommunication}
                size={28}
                interactive
                onRate={setReviewCommunication}
              />

              <Text style={styles.ratingLabel}>Effort</Text>
              <StarRating
                rating={reviewEffort}
                size={28}
                interactive
                onRate={setReviewEffort}
              />

              <Text style={styles.ratingLabel}>Comment</Text>
              <TextInput
                style={styles.commentInput}
                value={reviewComment}
                onChangeText={setReviewComment}
                placeholder="Share your experience with this volunteer..."
                placeholderTextColor="#999"
                multiline
                textAlignVertical="top"
              />
            </ScrollView>

            <Pressable
              style={[
                styles.submitReviewBtn,
                submittingReview && { opacity: 0.6 },
              ]}
              onPress={handleSubmitReview}
              disabled={submittingReview}
            >
              {submittingReview ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitReviewBtnText}>Submit Review</Text>
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

function ApplicantRow({
  applicant,
  onAccept,
  onReject,
  onComplete,
  onReview,
  hasReview,
}: {
  applicant: Applicant;
  onAccept?: () => void;
  onReject?: () => void;
  onComplete?: () => void;
  onReview?: () => void;
  hasReview?: boolean;
}) {
  const statusColor =
    applicant.status === "completed"
      ? "#34C759"
      : applicant.status === "accepted"
        ? "#208AEF"
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
      {applicant.status === "accepted" && (
        <View style={styles.applicantActions}>
          {onReview ? (
            <Pressable onPress={onReview} style={styles.reviewBtn}>
              <Ionicons name="star-outline" size={16} color="#208AEF" />
            </Pressable>
          ) : hasReview ? (
            <View style={styles.reviewedBadge}>
              <Ionicons name="star" size={14} color="#FFB800" />
            </View>
          ) : null}
          {onComplete && (
            <Pressable onPress={onComplete} style={styles.completeBtn}>
              <Ionicons name="checkmark-circle" size={18} color="#fff" />
            </Pressable>
          )}
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
  completeBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#34C759",
    justifyContent: "center",
    alignItems: "center",
  },
  completeAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#34C759",
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  completeAllText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
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
  reviewBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#208AEF18",
    justifyContent: "center",
    alignItems: "center",
  },
  reviewedBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#FFF8E1",
    justifyContent: "center",
    alignItems: "center",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#888",
    marginBottom: 16,
  },
  modalScroll: {
    marginBottom: 16,
  },
  ratingLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  commentInput: {
    backgroundColor: "#F7F8FA",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: "#222",
    minHeight: 100,
    marginTop: 4,
  },
  submitReviewBtn: {
    backgroundColor: "#208AEF",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  submitReviewBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
});
