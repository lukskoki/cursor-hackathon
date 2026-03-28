import {
  collection,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  getDocs,
} from "firebase/firestore";
import { getFirebaseFirestore } from "@/services/shared/firebaseApp";

export type LeaderboardEntry = {
  uid: string;
  email: string;
  displayName: string;
  points: number;
  rank: number;
};

export async function getLeaderboard(
  limit: number = 20,
): Promise<LeaderboardEntry[]> {
  const db = getFirebaseFirestore();

  const q = query(
    collection(db, "users"),
    where("role", "==", "volunteer"),
    orderBy("points", "desc"),
    firestoreLimit(limit),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc, index) => {
    const data = doc.data();
    return {
      uid: doc.id,
      email: data.email ?? "",
      displayName: data.displayName ?? data.email ?? "Anonymous",
      points: data.points ?? 0,
      rank: index + 1,
    };
  });
}

export const leaderboardService = {
  getLeaderboard,
};
