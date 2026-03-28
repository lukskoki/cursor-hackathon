import { useState } from "react";
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
import { Link, router } from "expo-router";
import { authService } from "@/services/shared/authService";
import type { UserRole } from "@/types/shared/user";

const ROLES: { value: UserRole; label: string }[] = [
  { value: "volunteer", label: "Volunteer" },
  { value: "organization", label: "Organization" },
];

function mapRegisterError(e: unknown): string {
  const code =
    typeof e === "object" && e !== null && "code" in e
      ? String((e as { code: string }).code)
      : "";
  switch (code) {
    case "auth/operation-not-allowed":
      return "Email/lozinka nije uključena u Firebaseu: Authentication → Sign-in method → Email/Password → Enable.";
    case "auth/email-already-in-use":
      return "Email je već registriran.";
    case "auth/invalid-email":
      return "Neispravan email.";
    case "auth/weak-password":
      return "Lozinka je prekratka (min. 6 znakova).";
    default:
      return e instanceof Error ? e.message : "Registracija nije uspjela.";
  }
}

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("volunteer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError("Upiši email i lozinku.");
      return;
    }
    if (password.length < 6) {
      setError("Lozinka mora imati najmanje 6 znakova.");
      return;
    }
    setLoading(true);
    try {
      await authService.registerWithEmail(email, password, role);
      if (role === "volunteer") {
        router.replace("/volunteer/tabs/home");
      } else {
        router.replace("/organization/tabs/dashboard");
      }
    } catch (e) {
      setError(mapRegisterError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        <Text style={styles.logo}>voluntee</Text>
        <Text style={styles.subtitle}>Novi račun</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#999"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Password (min. 6 znakova)"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          editable={!loading}
        />

        <Text style={styles.label}>Registriram se kao...</Text>
        <View style={styles.roleRow}>
          {ROLES.map((r) => (
            <Pressable
              key={r.value}
              style={[styles.roleBtn, role === r.value && styles.roleBtnActive]}
              onPress={() => setRole(r.value)}
              disabled={loading}
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
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnTxt}>Registriraj se</Text>
          )}
        </Pressable>

        <Link href="/shared/auth/login" asChild>
          <Pressable disabled={loading}>
            <Text style={styles.link}>Već imaš račun? Prijava</Text>
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
    marginBottom: 20,
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
  btn: {
    backgroundColor: "#208AEF",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 12,
    minHeight: 52,
    justifyContent: "center",
  },
  btnDisabled: { opacity: 0.7 },
  btnTxt: { color: "#fff", fontSize: 17, fontWeight: "700" },
  link: {
    color: "#208AEF",
    textAlign: "center",
    fontSize: 15,
    marginTop: 8,
  },
});
