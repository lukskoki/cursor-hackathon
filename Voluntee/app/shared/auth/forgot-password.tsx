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
import { sendPasswordResetEmail } from "firebase/auth";
import { getFirebaseAuth } from "@/services/shared/firebaseApp";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const auth = getFirebaseAuth();
      await sendPasswordResetEmail(auth, email.trim());
      setSent(true);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === "auth/user-not-found") {
        setError("No account found with that email.");
      } else if (code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
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
        <Text style={styles.subtitle}>Reset your password</Text>

        {sent ? (
          <View style={styles.successBox}>
            <Text style={styles.successTxt}>
              Password reset email sent! Check your inbox.
            </Text>
            <Pressable
              style={styles.btn}
              onPress={() => router.replace("/shared/auth/login")}
            >
              <Text style={styles.btnTxt}>Back to Login</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Text style={styles.hint}>
              Enter your email and we'll send you a link to reset your password.
            </Text>

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

            <Pressable
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleReset}
              disabled={loading}
            >
              <Text style={styles.btnTxt}>
                {loading ? "Sending…" : "Send Reset Link"}
              </Text>
            </Pressable>
          </>
        )}

        <Pressable
          style={styles.linkWrap}
          onPress={() => router.replace("/shared/auth/login")}
        >
          <Text style={styles.link}>← Back to login</Text>
        </Pressable>
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
  hint: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
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
  btn: {
    backgroundColor: "#208AEF",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.7 },
  btnTxt: { color: "#fff", fontSize: 17, fontWeight: "700" },
  linkWrap: { alignItems: "center", marginTop: 8 },
  link: { fontSize: 15, color: "#208AEF", fontWeight: "600" },
  successBox: { alignItems: "center", gap: 16 },
  successTxt: {
    fontSize: 16,
    color: "#16a34a",
    textAlign: "center",
    fontWeight: "600",
    lineHeight: 22,
  },
});
