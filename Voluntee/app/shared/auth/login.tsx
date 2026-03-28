import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import Constants from "expo-constants";
import { ResponseType } from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import { router } from "expo-router";
import { useLogin } from "@/hooks/shared/useAuth";
import { authService } from "@/services/shared/authService";
import { useAuthStore } from "@/store/authStore";
import type { UserRole } from "@/types/shared/user";
import { enterDevOrganizationDashboard } from "@/utils/dev/enterDevOrganization";

const ROLES: { value: UserRole; label: string }[] = [
  { value: "volunteer", label: "Volunteer" },
  { value: "organization", label: "Organization" },
];

function sanitizePublicEnv(value: string): string {
  return value
    .trim()
    .replace(/^\uFEFF/, "")
    .replace(/^["']|["']$/g, "");
}

const GOOGLE_WEB_CLIENT_ID = sanitizePublicEnv(
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "",
);

const EXPO_AUTH_REDIRECT_OVERRIDE =
  process.env.EXPO_PUBLIC_EXPO_AUTH_REDIRECT_URI?.trim() ?? "";

function useExpoAuthProxyRedirectUri(): string {
  return useMemo(() => {
    if (EXPO_AUTH_REDIRECT_OVERRIDE.length > 0) {
      return EXPO_AUTH_REDIRECT_OVERRIDE;
    }
    const full = Constants.expoConfig?.originalFullName;
    if (typeof full === "string" && full.length > 0) {
      return `https://auth.expo.io/${full}`;
    }
    const slug = Constants.expoConfig?.slug ?? "voluntee";
    return `https://auth.expo.io/@anonymous/${slug}`;
  }, []);
}

export default function Login() {
  const firebaseConfigured = useAuthStore((s) => s.firebaseConfigured);
  const { login, loading, error, setError } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("volunteer");
  const [googleLoading, setGoogleLoading] = useState(false);

  const googleRedirectUri = useExpoAuthProxyRedirectUri();
  const webId =
    GOOGLE_WEB_CLIENT_ID || "missing-web-client-id.apps.googleusercontent.com";
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: webId,
    iosClientId: webId,
    androidClientId: webId,
    redirectUri: googleRedirectUri,
    responseType: ResponseType.IdToken,
  });

  const busy = loading || googleLoading;

  useEffect(() => {
    if (__DEV__) {
      console.log("[Google OAuth] redirect (expected):\n", googleRedirectUri);
    }
  }, [googleRedirectUri]);

  useEffect(() => {
    if (!__DEV__ || !request) return;
    console.log("[Google OAuth] request.redirectUri:\n", request.redirectUri);
    if (request.url) {
      try {
        const u = new URL(request.url);
        const raw = u.searchParams.get("redirect_uri");
        const cid = u.searchParams.get("client_id");
        console.log("[Google OAuth] from auth URL:", {
          client_id: cid,
          response_type: u.searchParams.get("response_type"),
          redirect_uri_decoded: raw ? decodeURIComponent(raw) : null,
        });
      } catch {
        /* ignore */
      }
    }
  }, [request]);

  useEffect(() => {
    if (response?.type !== "error") return;
    const p = response.params;
    const desc =
      (typeof p.error_description === "string" && p.error_description) ||
      (response.error && "message" in response.error
        ? String(response.error.message)
        : "");
    const code = p.error ?? "oauth_error";
    setError(desc ? `${code}: ${desc}` : `Google OAuth: ${code}`);
  }, [response, setError]);

  useEffect(() => {
    if (response?.type !== "success") return;
    const idToken = response.params.id_token;
    if (!idToken) {
      setError(
        "Google did not return id_token. Check Web client ID and redirect URI in Google Cloud.",
      );
      return;
    }
    let cancelled = false;
    (async () => {
      setGoogleLoading(true);
      setError(null);
      try {
        const profile = await authService.signInWithGoogleIdToken(
          idToken,
          role,
        );
        if (!cancelled) {
          useAuthStore.getState().setUser(profile);
          router.replace(
            profile.role === "organization"
              ? "/organization/tabs/dashboard"
              : "/volunteer/tabs/home",
          );
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Google sign-in failed.");
        }
      } finally {
        if (!cancelled) setGoogleLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [response, role, setError]);

  const handleLogin = () => {
    setError(null);
    void login(email, password);
  };

  const handleGoogle = async () => {
    if (!GOOGLE_WEB_CLIENT_ID) {
      setError(
        "Add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID to .env (Google Cloud → OAuth Web client).",
      );
      return;
    }
    setError(null);
    await promptAsync();
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scroll}
      >
        <Text style={styles.logo}>Voluntee</Text>
        <Text style={styles.subtitle}>Log in to continue</Text>

        {!firebaseConfigured ? (
          <Text style={styles.warn}>
            Firebase is not configured. Add EXPO_PUBLIC_FIREBASE_* keys to your
            environment and restart the dev server.
          </Text>
        ) : null}

        {GOOGLE_WEB_CLIENT_ID ? (
          <>
            <Pressable
              style={[styles.googleBtn, busy && styles.btnDisabled]}
              onPress={() => void handleGoogle()}
              disabled={busy || !request}
            >
              {googleLoading ? (
                <ActivityIndicator color="#333" />
              ) : (
                <Text style={styles.googleBtnTxt}>Continue with Google</Text>
              )}
            </Pressable>
            <Text style={styles.divider}>or email</Text>
          </>
        ) : (
          <Text style={styles.hintGoogle}>
            Add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID to .env for Google sign-in.
          </Text>
        )}

        <Text style={styles.label}>I am a…</Text>
        <View style={styles.roleRow}>
          {ROLES.map((r) => (
            <Pressable
              key={r.value}
              style={[
                styles.roleBtn,
                role === r.value && styles.roleBtnActive,
              ]}
              onPress={() => setRole(r.value)}
              disabled={busy}
            >
              <Text
                style={[
                  styles.roleTxt,
                  role === r.value && styles.roleTxtActive,
                ]}
              >
                {r.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {error ? <Text style={styles.err}>{error}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#999"
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          value={email}
          onChangeText={setEmail}
          editable={!busy}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry
          autoComplete="password"
          value={password}
          onChangeText={setPassword}
          editable={!busy}
        />

        <Pressable
          style={[styles.loginBtn, busy && styles.btnDisabled]}
          onPress={handleLogin}
          disabled={busy}
        >
          <Text style={styles.loginTxt}>
            {loading ? "Signing in…" : "Log in"}
          </Text>
        </Pressable>

        <Pressable
          style={styles.linkWrap}
          onPress={() => router.replace("/shared/onboarding/welcome")}
        >
          <Text style={styles.link}>← Back to welcome</Text>
        </Pressable>

        <View style={styles.signupBlock}>
          <Text style={styles.signupHeading}>New here?</Text>
          <Pressable
            style={styles.signupLinkRow}
            onPress={() =>
              router.replace("/shared/auth/register?role=volunteer")
            }
          >
            <Text style={styles.linkInline}>Sign up as volunteer</Text>
          </Pressable>
          <Pressable
            style={styles.signupLinkRow}
            onPress={() =>
              router.replace("/shared/auth/register?role=organization")
            }
          >
            <Text style={styles.linkInline}>Sign up as organization</Text>
          </Pressable>
        </View>

        {__DEV__ ? (
          <Pressable
            style={styles.devBypass}
            onPress={() => enterDevOrganizationDashboard()}
          >
            <Text style={styles.devBypassTxt}>[DEV] Open organizer dashboard</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 24,
    gap: 12,
  },
  logo: {
    fontSize: 36,
    fontWeight: "800",
    color: "#208AEF",
    textAlign: "center",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 15,
    color: "#888",
    textAlign: "center",
    marginBottom: 12,
  },
  warn: {
    fontSize: 13,
    color: "#b45309",
    backgroundColor: "#fffbeb",
    padding: 12,
    borderRadius: 10,
    overflow: "hidden",
  },
  googleBtn: {
    borderWidth: 1.5,
    borderColor: "#ddd",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#fff",
    minHeight: 52,
    justifyContent: "center",
  },
  googleBtnTxt: { fontSize: 16, fontWeight: "600", color: "#333" },
  divider: {
    textAlign: "center",
    fontSize: 13,
    color: "#999",
    marginBottom: 4,
  },
  hintGoogle: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginBottom: 8,
  },
  label: { fontSize: 14, color: "#555", marginTop: 4 },
  roleRow: { flexDirection: "row", gap: 10 },
  roleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#ddd",
    alignItems: "center",
  },
  roleBtnActive: {
    borderColor: "#208AEF",
    backgroundColor: "#EDF5FF",
  },
  roleTxt: { fontSize: 15, color: "#666" },
  roleTxtActive: { color: "#208AEF", fontWeight: "600" },
  err: {
    fontSize: 14,
    color: "#c53030",
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: "#fafafa",
  },
  loginBtn: {
    backgroundColor: "#208AEF",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.7 },
  loginTxt: { color: "#fff", fontSize: 17, fontWeight: "700" },
  linkWrap: { alignItems: "center", marginTop: 8 },
  link: { fontSize: 15, color: "#208AEF", fontWeight: "600" },
  signupBlock: {
    marginTop: 20,
    alignItems: "center",
    gap: 10,
  },
  signupHeading: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  signupLinkRow: {
    paddingVertical: 4,
  },
  linkInline: { fontSize: 15, color: "#208AEF", fontWeight: "600" },
  devBypass: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#208AEF",
    backgroundColor: "#EFF6FF",
    alignItems: "center",
  },
  devBypassTxt: { fontSize: 13, fontWeight: "700", color: "#1D4ED8" },
});
