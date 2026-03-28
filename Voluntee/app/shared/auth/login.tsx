import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useLogin } from "@/hooks/shared/useAuth";
import { useAuthStore } from "@/store/authStore";

export default function Login() {
  const firebaseConfigured = useAuthStore((s) => s.firebaseConfigured);
  const { login, loading, error, setError } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    setError(null);
    void login(email, password);
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
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry
          autoComplete="password"
          value={password}
          onChangeText={setPassword}
        />

        <Pressable
          style={[styles.loginBtn, loading && styles.btnDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.loginTxt}>{loading ? "Signing in…" : "Log in"}</Text>
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
});
