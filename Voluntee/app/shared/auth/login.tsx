import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useAuthStore, type UserRole } from "@/store/authStore";

const ROLES: { value: UserRole; label: string }[] = [
  { value: "volunteer", label: "Volunteer" },
  { value: "organization", label: "Organization" },
];

export default function Login() {
  const signIn = useAuthStore((s) => s.signIn);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("volunteer");

  const handleLogin = () => {
    signIn(email || "test@voluntee.app", role);
    if (role === "volunteer") {
      router.replace("/volunteer/tabs/home");
    } else {
      router.replace("/organization/tabs/dashboard");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        <Text style={styles.logo}>voluntee</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#999"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>I am a...</Text>
        <View style={styles.roleRow}>
          {ROLES.map((r) => (
            <Pressable
              key={r.value}
              style={[styles.roleBtn, role === r.value && styles.roleBtnActive]}
              onPress={() => setRole(r.value)}
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

        <Pressable style={styles.loginBtn} onPress={handleLogin}>
          <Text style={styles.loginTxt}>Log in</Text>
        </Pressable>
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
  loginBtn: {
    backgroundColor: "#208AEF",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 12,
  },
  loginTxt: { color: "#fff", fontSize: 17, fontWeight: "700" },
});
