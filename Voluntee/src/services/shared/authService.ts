import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb, isFirebaseConfigured } from "@/services/shared/firebase";
import type { UserRole } from "@/types/shared/user";

const USERS = "users";

function requireFirebase() {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase nije konfiguriran (.env).");
  }
}

export const authService = {
  async getUserRole(uid: string): Promise<UserRole | null> {
    requireFirebase();
    const snap = await getDoc(doc(getFirebaseDb(), USERS, uid));
    if (!snap.exists()) return null;
    const role = snap.data()?.role;
    return role === "organization" ? "organization" : role === "volunteer" ? "volunteer" : null;
  },

  /**
   * Ako dokument ne postoji, kreira ga s preferredRole.
   * Ako postoji, vraća ulogu iz Firestorea (ne mijenja je).
   */
  async ensureUserProfile(
    uid: string,
    email: string,
    preferredRole: UserRole
  ): Promise<UserRole> {
    requireFirebase();
    const ref = doc(getFirebaseDb(), USERS, uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const role = snap.data()?.role;
      if (role === "organization" || role === "volunteer") return role;
    }
    await setDoc(ref, {
      email,
      role: preferredRole,
      createdAt: serverTimestamp(),
    });
    return preferredRole;
  },

  /**
   * ID token s Googlea (expo-auth-session). U Firebase konzoli mora biti uključen Google provider.
   */
  async signInWithGoogleIdToken(
    idToken: string,
    preferredRole: UserRole
  ): Promise<{ user: User; role: UserRole }> {
    requireFirebase();
    const auth = getFirebaseAuth();
    const credential = GoogleAuthProvider.credential(idToken);
    const cred = await signInWithCredential(auth, credential);
    const user = cred.user;
    const email = user.email ?? "";
    const role = await authService.ensureUserProfile(user.uid, email, preferredRole);
    return { user, role };
  },

  async signInWithEmail(
    email: string,
    password: string,
    preferredRole: UserRole
  ): Promise<{ user: User; role: UserRole }> {
    requireFirebase();
    const auth = getFirebaseAuth();
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    const user = cred.user;
    const role = await authService.ensureUserProfile(
      user.uid,
      user.email ?? email.trim(),
      preferredRole
    );
    return { user, role };
  },

  async registerWithEmail(
    email: string,
    password: string,
    role: UserRole
  ): Promise<User> {
    requireFirebase();
    const auth = getFirebaseAuth();
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const user = cred.user;
    await setDoc(doc(getFirebaseDb(), USERS, user.uid), {
      email: user.email ?? email.trim(),
      role,
      createdAt: serverTimestamp(),
    });
    return user;
  },

  async signOut(): Promise<void> {
    if (!isFirebaseConfigured()) return;
    await firebaseSignOut(getFirebaseAuth());
  },
};
