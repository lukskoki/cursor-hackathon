import {
  writeBatch,
  doc,
  collection,
  query,
  where,
  getDocs,
  getDoc,
  increment,
} from "firebase/firestore";
import { getFirebaseFirestore } from "@/services/shared/firebaseApp";

function db() {
  return getFirebaseFirestore();
}

export const eventCompletionService = {
  async completeVolunteer(
    applicationId: string,
    eventId: string,
    volunteerId: string,
  ): Promise<void> {
    const firestore = db();

    const eventSnap = await getDoc(doc(firestore, "events", eventId));
    if (!eventSnap.exists()) throw new Error("Event not found");
    const points = (eventSnap.data().points as number) ?? 0;

    const batch = writeBatch(firestore);
    batch.update(doc(firestore, "applications", applicationId), {
      status: "completed",
    });
    batch.update(doc(firestore, "users", volunteerId), {
      totalPoints: increment(points),
      points: increment(points),
      eventsCompleted: increment(1),
    });
    await batch.commit();
  },

  async completeAllForEvent(eventId: string): Promise<number> {
    const firestore = db();

    const q = query(
      collection(firestore, "applications"),
      where("eventId", "==", eventId),
      where("status", "==", "accepted"),
    );
    const snap = await getDocs(q);
    if (snap.empty) return 0;

    const eventSnap = await getDoc(doc(firestore, "events", eventId));
    if (!eventSnap.exists()) throw new Error("Event not found");
    const points = (eventSnap.data().points as number) ?? 0;

    const batch = writeBatch(firestore);
    for (const appDoc of snap.docs) {
      const data = appDoc.data();
      batch.update(doc(firestore, "applications", appDoc.id), {
        status: "completed",
      });
      batch.update(doc(firestore, "users", data.userId), {
        totalPoints: increment(points),
        points: increment(points),
        eventsCompleted: increment(1),
      });
    }
    await batch.commit();

    return snap.size;
  },
};
