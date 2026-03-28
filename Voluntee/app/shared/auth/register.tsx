import { useMemo, useState } from "react";
import {
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  useRegisterOrganization,
  useRegisterVolunteer,
} from "@/hooks/shared/useAuth";
import { useAuthStore } from "@/store/authStore";
import {
  isEmail,
  isNonEmpty,
  isPasswordValid,
  isValidOib,
  minPasswordLength,
  normalizeOib,
} from "@/utils/shared/validation";

type Role = "volunteer" | "organization";

export default function Register() {
  const { role: roleParam } = useLocalSearchParams<{ role?: string }>();
  const role: Role =
    roleParam === "organization" ? "organization" : "volunteer";

  const firebaseConfigured = useAuthStore((s) => s.firebaseConfigured);
  const vol = useRegisterVolunteer();
  const org = useRegisterOrganization();
  const loading = role === "volunteer" ? vol.loading : org.loading;
  const remoteError = role === "volunteer" ? vol.error : org.error;
  const setRemoteError =
    role === "volunteer" ? vol.setError : org.setError;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [oib, setOib] = useState("");
  const [contactPersonName, setContactPersonName] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const title = useMemo(
    () =>
      role === "volunteer"
        ? "Create volunteer account"
        : "Create organization account",
    [role],
  );

  const submit = () => {
    setLocalError(null);
    setRemoteError(null);

    if (!isEmail(email)) {
      setLocalError("Enter a valid email address.");
      return;
    }
    if (!isPasswordValid(password)) {
      setLocalError(
        `Password must be at least ${minPasswordLength()} characters.`,
      );
      return;
    }
    if (password !== confirm) {
      setLocalError("Passwords do not match.");
      return;
    }

    if (role === "volunteer") {
      if (!isNonEmpty(displayName)) {
        setLocalError("Enter your name.");
        return;
      }
      void vol.register({
        email,
        password,
        displayName: displayName.trim(),
      });
      return;
    }

    if (!isNonEmpty(organizationName)) {
      setLocalError("Enter the organization name.");
      return;
    }
    const oibDigits = normalizeOib(oib);
    if (!isValidOib(oibDigits)) {
      setLocalError("Enter a valid 11-digit Croatian OIB.");
      return;
    }

    void org.register({
      email,
      password,
      organizationName: organizationName.trim(),
      oib: oibDigits,
      contactPersonName: contactPersonName.trim() || undefined,
    });
  };

  const error = localError ?? remoteError;

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.scrollView}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.form}>
          <Text style={styles.logo}>Voluntee</Text>
          <Text style={styles.subtitle}>{title}</Text>

          {!firebaseConfigured ? (
            <Text style={styles.warn}>
              Firebase is not configured. Add EXPO_PUBLIC_FIREBASE_* keys to your
              environment and restart the dev server.
            </Text>
          ) : null}

          {error ? <Text style={styles.err}>{error}</Text> : null}

          {role === "volunteer" ? (
            <TextInput
              style={styles.input}
              placeholder="Full name"
              placeholderTextColor="#999"
              value={displayName}
              onChangeText={setDisplayName}
              autoComplete="name"
            />
          ) : (
            <>
              <TextInput
                style={styles.input}
                placeholder="Organization name"
                placeholderTextColor="#999"
                value={organizationName}
                onChangeText={setOrganizationName}
              />
              <TextInput
                style={styles.input}
                placeholder="OIB (11 digits)"
                placeholderTextColor="#999"
                keyboardType="number-pad"
                value={oib}
                onChangeText={setOib}
              />
              <TextInput
                style={styles.input}
                placeholder="Contact person (optional)"
                placeholderTextColor="#999"
                value={contactPersonName}
                onChangeText={setContactPersonName}
              />
            </>
          )}

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
            autoComplete="new-password"
            value={password}
            onChangeText={setPassword}
          />

          <TextInput
            style={styles.input}
            placeholder="Confirm password"
            placeholderTextColor="#999"
            secureTextEntry
            autoComplete="new-password"
            value={confirm}
            onChangeText={setConfirm}
          />

          <Pressable
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={submit}
            disabled={loading}
          >
            <Text style={styles.btnTxt}>
              {loading ? "Creating account…" : "Sign up"}
            </Text>
          </Pressable>

          <Pressable
            style={styles.linkWrap}
            onPress={() => router.replace("/shared/auth/login")}
          >
            <Text style={styles.link}>Already have an account? Log in</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  scrollView: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 32,
  },
  form: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    gap: 12,
  },
  logo: {
    fontSize: 28,
    fontWeight: "800",
    color: "#208AEF",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 8,
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
  btn: {
    backgroundColor: "#208AEF",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.7 },
  btnTxt: { color: "#fff", fontSize: 17, fontWeight: "700" },
  linkWrap: { alignItems: "center", marginTop: 16 },
  link: { fontSize: 15, color: "#208AEF", fontWeight: "600" },
});
