import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import Constants from "expo-constants";
import * as Google from "expo-auth-session/providers/google";
import { Link, router } from "expo-router";
import { authService } from "@/services/shared/authService";
import type { UserRole } from "@/types/shared/user";

const ROLES: { value: UserRole; label: string }[] = [
  { value: "volunteer", label: "Volunteer" },
  { value: "organization", label: "Organization" },
];

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "";

/**
 * Google Web OAuth prihvaća samo https:// redirecte. Expo Go inače generira exp://… — to NE ide u Google.
 * Proxy URL mora biti na listi: Google Cloud → Web client → Authorized redirect URIs.
 */
function useExpoAuthProxyRedirectUri(): string {
  return useMemo(() => {
    const full = Constants.expoConfig?.originalFullName;
    if (typeof full === "string" && full.length > 0) {
      return `https://auth.expo.io/${full}`;
    }
    const slug = Constants.expoConfig?.slug ?? "voluntee";
    return `https://auth.expo.io/@anonymous/${slug}`;
  }, []);
}

function mapAuthError(e: unknown): string {
  const code =
    typeof e === "object" && e !== null && "code" in e
      ? String((e as { code: string }).code)
      : "";
  switch (code) {
    case "auth/invalid-email":
      return "Neispravan email.";
    case "auth/user-disabled":
      return "Račun je onemogućen.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Netočan email ili lozinka.";
    case "auth/account-exists-with-different-credential":
      return "Email je već registriran drugom metodom.";
    case "auth/too-many-requests":
      return "Previše pokušaja. Pričekaj malo.";
    default:
      return e instanceof Error ? e.message : "Prijava nije uspjela.";
  }
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("volunteer");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const googleRedirectUri = useExpoAuthProxyRedirectUri();

  /**
   * Za https://auth.expo.io proxy redirect, Google traži da redirect bude na Web OAuth klijentu.
   * Koristi isti Web client ID na iOS/Android (ne zasebni iOS client + exp:// redirect).
   */
  const webId =
    GOOGLE_WEB_CLIENT_ID || "missing-web-client-id.apps.googleusercontent.com";
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: webId,
    iosClientId: webId,
    androidClientId: webId,
    redirectUri: googleRedirectUri,
  });

  useEffect(() => {
    if (__DEV__) {
      console.log(
        "[Google OAuth] U Web client → Authorized redirect URIs dodaj TOČNO:\n",
        googleRedirectUri
      );
    }
  }, [googleRedirectUri]);

  useEffect(() => {
    if (response?.type !== "success") return;
    const idToken = response.params.id_token;
    if (!idToken) {
      setError("Google nije vratio id_token. Provjeri Web client ID i redirect URI u Google Cloud.");
      return;
    }
    let cancelled = false;
    (async () => {
      setGoogleLoading(true);
      setError(null);
      try {
        await authService.signInWithGoogleIdToken(idToken, role);
        if (!cancelled) {
          if (role === "volunteer") {
            router.replace("/volunteer/tabs/home");
          } else {
            router.replace("/organization/tabs/dashboard");
          }
        }
      } catch (e) {
        if (!cancelled) setError(mapAuthError(e));
      } finally {
        if (!cancelled) setGoogleLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [response, role]);

  const busy = loading || googleLoading;

  const handleLogin = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError("Upiši email i lozinku.");
      return;
    }
    setLoading(true);
    try {
      await authService.signInWithEmail(email, password, role);
      if (role === "volunteer") {
        router.replace("/volunteer/tabs/home");
      } else {
        router.replace("/organization/tabs/dashboard");
      }
    } catch (e) {
      setError(mapAuthError(e));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    if (!GOOGLE_WEB_CLIENT_ID) {
      setError("Dodaj EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID u .env (Google Cloud → OAuth Web client).");
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
      <View style={styles.container}>
        <Text style={styles.logo}>voluntee</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        {GOOGLE_WEB_CLIENT_ID ? (
          <>
            <Pressable
              style={[styles.googleBtn, busy && styles.loginBtnDisabled]}
              onPress={handleGoogle}
              disabled={busy || !request}
            >
              {googleLoading ? (
                <ActivityIndicator color="#333" />
              ) : (
                <Text style={styles.googleBtnTxt}>Nastavi s Googleom</Text>
              )}
            </Pressable>
            <Text style={styles.divider}>ili email</Text>
          </>
        ) : (
          <Text style={styles.hintGoogle}>
            Za Google prijavu dodaj EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID u .env.
          </Text>
        )}

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#999"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          editable={!busy}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          editable={!busy}
        />

        <Text style={styles.label}>I am a...</Text>
        <View style={styles.roleRow}>
          {ROLES.map((r) => (
            <Pressable
              key={r.value}
              style={[styles.roleBtn, role === r.value && styles.roleBtnActive]}
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

        <Pressable
          style={[styles.loginBtn, busy && styles.loginBtnDisabled]}
          onPress={handleLogin}
          disabled={busy}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginTxt}>Log in</Text>
          )}
        </Pressable>

        <Link href="/shared/auth/register" asChild>
          <Pressable disabled={busy}>
            <Text style={styles.link}>Nemaš račun? Registracija</Text>
          </Pressable>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 14,
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
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: "#fafafa",
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
  err: { color: "#c62828", fontSize: 14, textAlign: "center" },
  loginBtn: {
    backgroundColor: "#208AEF",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 12,
    minHeight: 52,
    justifyContent: "center",
  },
  loginBtnDisabled: { opacity: 0.7 },
  loginTxt: { color: "#fff", fontSize: 17, fontWeight: "700" },
  link: {
    color: "#208AEF",
    textAlign: "center",
    fontSize: 15,
    marginTop: 8,
  },
});
