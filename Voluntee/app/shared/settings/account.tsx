import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuthStore } from "@/store/authStore";
import { getFirebaseAuth } from "@/services/shared/firebaseApp";
import { signOut } from "firebase/auth";

export default function Account() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const handleSignOut = async () => {
    try {
      const auth = getFirebaseAuth();
      await signOut(auth);
      setUser(null);
      router.replace("/shared/onboarding/welcome");
    } catch {
      Alert.alert("Error", "Failed to sign out. Please try again.");
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Account Deletion",
              "Account deletion has been requested. You will receive a confirmation email."
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={26} color="#222" />
        </Pressable>
        <Text style={styles.heading}>Account</Text>
        <View style={{ width: 26 }} />
      </View>

      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={36} color="#208AEF" />
        </View>
        <Text style={styles.email}>{user?.email ?? "Not signed in"}</Text>
        <Text style={styles.role}>
          {user?.role === "organization" ? "Organization" : "Volunteer"}
        </Text>
      </View>

      <View style={styles.card}>
        <Pressable
          style={[styles.row, styles.rowBorder]}
          onPress={() => router.push("/shared/auth/forgot-password")}
        >
          <Ionicons
            name="lock-closed-outline"
            size={22}
            color="#208AEF"
            style={styles.rowIcon}
          />
          <Text style={styles.rowLabel}>Change Password</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </Pressable>

        <Pressable style={styles.row} onPress={handleDeleteAccount}>
          <Ionicons
            name="trash-outline"
            size={22}
            color="#e53e3e"
            style={styles.rowIcon}
          />
          <Text style={[styles.rowLabel, { color: "#e53e3e" }]}>
            Delete Account
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </Pressable>
      </View>

      <Pressable style={styles.signOutBtn} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={22} color="#fff" />
        <Text style={styles.signOutTxt}>Sign Out</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  heading: { fontSize: 20, fontWeight: "700" },
  profileSection: {
    alignItems: "center",
    paddingVertical: 28,
    gap: 8,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#E8F1FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  email: { fontSize: 16, fontWeight: "600", color: "#222" },
  role: { fontSize: 14, color: "#888", textTransform: "capitalize" },
  card: {
    marginHorizontal: 20,
    backgroundColor: "#fafafa",
    borderRadius: 14,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  rowIcon: { marginRight: 14 },
  rowLabel: { flex: 1, fontSize: 16, color: "#222" },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginHorizontal: 20,
    marginTop: 32,
    backgroundColor: "#e53e3e",
    paddingVertical: 16,
    borderRadius: 14,
  },
  signOutTxt: { color: "#fff", fontSize: 17, fontWeight: "700" },
});
