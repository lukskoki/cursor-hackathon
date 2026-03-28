import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { getFirebaseFirestore } from "@/services/shared/firebaseApp";
import type { Review } from "@/types/shared/review";

const REVIEWS = "reviews";

function db() {
  return getFirebaseFirestore();
}

export const reviewService = {
  async submitReview(review: Omit<Review, "id">): Promise<string> {
    const docRef = await addDoc(collection(db(), REVIEWS), review);
    return docRef.id;
  },

  async getReviewsForUser(userId: string): Promise<Review[]> {
    const q = query(
      collection(db(), REVIEWS),
      where("targetId", "==", userId),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Review);
  },

  async getReviewsByUser(userId: string): Promise<Review[]> {
    const q = query(
      collection(db(), REVIEWS),
      where("reviewerId", "==", userId),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Review);
  },

  async getReviewsForEvent(eventId: string): Promise<Review[]> {
    const q = query(
      collection(db(), REVIEWS),
      where("eventId", "==", eventId),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Review);
  },

  async hasReviewed(eventId: string, reviewerId: string): Promise<boolean> {
    const q = query(
      collection(db(), REVIEWS),
      where("eventId", "==", eventId),
      where("reviewerId", "==", reviewerId),
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  },
};
