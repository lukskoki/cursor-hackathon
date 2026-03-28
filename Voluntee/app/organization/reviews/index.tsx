import { useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuthStore } from "@/store/authStore";
import { useReceivedReviews } from "@/hooks/shared/useReviews";
import { StarRating } from "@/components/shared/StarRating";
import type { Review } from "@/types/shared/review";

const PRIMARY = "#208AEF";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function SubRating({ label, value }: { label: string; value?: number }) {
  if (value == null) return null;
  return (
    <View style={styles.subRatingRow}>
      <Text style={styles.subRatingLabel}>{label}</Text>
      <StarRating rating={value} size={14} />
      <Text style={styles.subRatingValue}>{value}/5</Text>
    </View>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatarCircle}>
          <Ionicons name="person" size={18} color={PRIMARY} />
        </View>
        <View style={styles.cardHeaderText}>
          <Text style={styles.cardName} numberOfLines={1}>
            {review.reviewerName}
          </Text>
          <Text style={styles.cardDate}>{formatDate(review.createdAt)}</Text>
        </View>
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={14} color="#FFB800" />
          <Text style={styles.ratingBadgeText}>{review.rating.toFixed(1)}</Text>
        </View>
      </View>

      <View style={styles.starsRow}>
        <StarRating rating={review.rating} size={16} />
      </View>

      {review.comment ? (
        <Text style={styles.comment}>{review.comment}</Text>
      ) : null}

      <View style={styles.breakdownSection}>
        <SubRating label="Organization Quality" value={review.organizationQuality} />
        <SubRating label="Instructions Clarity" value={review.instructionsClarity} />
        <SubRating label="Overall Experience" value={review.overallExperience} />
      </View>
    </View>
  );
}

export default function OrganizationReviews() {
  const user = useAuthStore((s) => s.user);
  const { reviews, loading } = useReceivedReviews(user?.id);

  const average = useMemo(() => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return sum / reviews.length;
  }, [reviews]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <Text style={styles.screenTitle}>Organization Reviews</Text>
            {reviews.length > 0 ? (
              <View style={styles.summaryCard}>
                <Text style={styles.bigRating}>{average.toFixed(1)}</Text>
                <StarRating rating={average} size={24} />
                <Text style={styles.reviewCount}>
                  Based on {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                </Text>
              </View>
            ) : null}
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="chatbubbles-outline" size={48} color="#ccc" />
            <Text style={styles.emptyTitle}>No reviews yet</Text>
            <Text style={styles.emptyMsg}>
              Reviews from volunteers will appear here after events are
              completed.
            </Text>
          </View>
        }
        renderItem={({ item }) => <ReviewCard review={item} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContent: { paddingHorizontal: 20, paddingBottom: 32 },
  screenTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111",
    paddingTop: 16,
    paddingBottom: 16,
  },
  summaryCard: {
    alignItems: "center",
    backgroundColor: "#F7F8FA",
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    gap: 8,
  },
  bigRating: { fontSize: 48, fontWeight: "800", color: "#111" },
  reviewCount: { fontSize: 13, color: "#888", marginTop: 4 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    padding: 16,
    marginBottom: 12,
    gap: 10,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PRIMARY + "14",
    justifyContent: "center",
    alignItems: "center",
  },
  cardHeaderText: { flex: 1, gap: 2 },
  cardName: { fontSize: 15, fontWeight: "600", color: "#222" },
  cardDate: { fontSize: 12, color: "#999" },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFF8E1",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  ratingBadgeText: { fontSize: 14, fontWeight: "700", color: "#333" },

  starsRow: { paddingVertical: 2 },
  comment: { fontSize: 14, lineHeight: 20, color: "#444" },

  breakdownSection: { gap: 6, paddingTop: 6 },
  subRatingRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  subRatingLabel: { fontSize: 13, color: "#666", width: 140 },
  subRatingValue: { fontSize: 12, color: "#999" },

  emptyWrap: {
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 32,
    gap: 10,
  },
  emptyTitle: { fontSize: 18, fontWeight: "600", color: "#333" },
  emptyMsg: { fontSize: 14, color: "#888", textAlign: "center", lineHeight: 20 },
});
