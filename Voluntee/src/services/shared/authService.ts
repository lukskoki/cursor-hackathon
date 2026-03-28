import {
  createUserWithEmailAndPassword,
  deleteUser,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import type { RegisterOrganizationInput, RegisterVolunteerInput } from "@/types/shared/auth";
import type { UserProfile, UserRole } from "@/types/shared/user";
import { isFirebaseConfigured } from "@/config/firebaseEnv";
import { getFirebaseAuth } from "./firebaseApp";
import {
  createOrganizationProfile,
  createVolunteerProfile,
  fetchUserProfileWithRetry,
} from "./userProfileService";

export class AuthConfigurationError extends Error {
  constructor() {
    super("Firebase is not configured.");
    this.name = "AuthConfigurationError";
  }
}

export function mapFirebaseAuthError(code: string): string {
  switch (code) {
    case "auth/invalid-email":
      return "Invalid email address.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Invalid email or password.";
    case "auth/email-already-in-use":
      return "An account already exists with this email.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    case "auth/operation-not-allowed":
      return "This sign-in method is disabled in Firebase (Authentication → Sign-in method).";
    case "auth/network-request-failed":
      return "Network error. Check your connection.";
    default:
      return "Something went wrong. Please try again.";
  }
}

function assertConfigured(): void {
  if (!isFirebaseConfigured()) {
    throw new AuthConfigurationError();
  }
}

function authErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "code" in err) {
    return mapFirebaseAuthError(String((err as { code: string }).code));
  }
  return "Something went wrong. Please try again.";
}

export const authService = {
  isConfigured(): boolean {
    return isFirebaseConfigured();
  },

  async signIn(email: string, password: string): Promise<UserProfile> {
    assertConfigured();
    const auth = getFirebaseAuth();
    const cred = await signInWithEmailAndPassword(
      auth,
      email.trim(),
      password,
    ).catch((e: unknown) => {
      throw new Error(authErrorMessage(e));
    });
    const profile = await fetchUserProfileWithRetry(cred.user.uid);
    if (!profile) {
      await signOut(auth);
      throw new Error("Your account has no profile. Contact support.");
    }
    return profile;
  },

  /**
   * Google (expo-auth-session id_token). New users get a volunteer profile unless
   * they requested organization — then they must use email registration.
   */
  async signInWithGoogleIdToken(
    idToken: string,
    preferredRole: UserRole,
  ): Promise<UserProfile> {
    assertConfigured();
    const auth = getFirebaseAuth();
    const credential = GoogleAuthProvider.credential(idToken);
    const cred = await signInWithCredential(auth, credential).catch(
      (e: unknown) => {
        throw new Error(authErrorMessage(e));
      },
    );
    let profile = await fetchUserProfileWithRetry(cred.user.uid);
    if (!profile) {
      const email = cred.user.email ?? "";
      if (preferredRole === "organization") {
        await signOut(auth);
        throw new Error(
          "Organization accounts must register with email. Use the organization sign-up flow.",
        );
      }
      const displayName =
        cred.user.displayName?.trim() ||
        email.split("@")[0] ||
        "Volunteer";
      await createVolunteerProfile(cred.user.uid, email, displayName);
      const name = displayName.trim();
      if (name) {
        await updateProfile(cred.user, { displayName: name }).catch(() => {});
      }
      profile = await fetchUserProfileWithRetry(cred.user.uid);
    }
    if (!profile) {
      await signOut(auth);
      throw new Error("Could not load your profile. Try again.");
    }
    return profile;
  },

  async signOutUser(): Promise<void> {
    if (!isFirebaseConfigured()) {
      return;
    }
    const auth = getFirebaseAuth();
    await signOut(auth);
  },

  async registerVolunteer(input: RegisterVolunteerInput): Promise<UserProfile> {
    assertConfigured();
    const auth = getFirebaseAuth();
    const email = input.email.trim();
    const cred = await createUserWithEmailAndPassword(
      auth,
      email,
      input.password,
    ).catch((e: unknown) => {
      throw new Error(authErrorMessage(e));
    });
    try {
      await createVolunteerProfile(cred.user.uid, email, input.displayName);
      const name = input.displayName.trim();
      if (name) {
        await updateProfile(cred.user, { displayName: name });
      }
    } catch (e) {
      await deleteUser(cred.user).catch(() => {});
      throw e instanceof Error ? e : new Error("Could not create profile.");
    }
    const profile = await fetchUserProfileWithRetry(cred.user.uid);
    if (!profile) {
      throw new Error("Could not load your profile. Try signing in.");
    }
    return profile;
  },

  async registerOrganization(
    input: RegisterOrganizationInput,
  ): Promise<UserProfile> {
    assertConfigured();
    const auth = getFirebaseAuth();
    const email = input.email.trim();
    const cred = await createUserWithEmailAndPassword(
      auth,
      email,
      input.password,
    ).catch((e: unknown) => {
      throw new Error(authErrorMessage(e));
    });
    try {
      await createOrganizationProfile(cred.user.uid, {
        email,
        organizationName: input.organizationName,
        oib: input.oib.replace(/\s/g, ""),
        contactPersonName: input.contactPersonName,
      });
    } catch (e) {
      await deleteUser(cred.user).catch(() => {});
      throw e instanceof Error ? e : new Error("Could not create profile.");
    }
    const profile = await fetchUserProfileWithRetry(cred.user.uid);
    if (!profile) {
      throw new Error("Could not load your profile. Try signing in.");
    }
    return profile;
  },
};
