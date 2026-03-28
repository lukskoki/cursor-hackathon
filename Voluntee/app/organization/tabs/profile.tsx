import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { authService } from "@/services/shared/authService";
import { useAuthStore } from "@/store/authStore";

export default function OrganizationProfile() {
  const user = useAuthStore((s) => s.user);
  const orgName = user?.role === "organization" ? user.organizationName : "";
  const email = user?.email?.trim() ?? "";

  const handleLogout = async () => {
    await authService.signOutUser();
    useAuthStore.getState().setDevOrganizationBypass(false);
    useAuthStore.getState().setUser(null);
    router.replace("/");
  };

  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.heading}>Organization profile</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Organization</Text>
        <Text style={styles.orgName}>{orgName || "—"}</Text>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.email}>{email || "—"}</Text>
      </View>
      <Pressable style={styles.logoutBtn} onPress={() => void handleLogout()}>
        <Text style={styles.logoutTxt}>Log out</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FAFBFC",
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  heading: { fontSize: 24, fontWeight: "800", color: "#0F1729", marginBottom: 20 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    marginBottom: 28,
  },
  label: { fontSize: 12, fontWeight: "700", color: "#888", marginBottom: 4, letterSpacing: 0.4 },
  orgName: { fontSize: 18, fontWeight: "700", color: "#0F1729", marginBottom: 16 },
  email: { fontSize: 16, color: "#444" },
  logoutBtn: {
    alignSelf: "flex-start",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#e53e3e",
  },
  logoutTxt: { color: "#e53e3e", fontSize: 15, fontWeight: "600" },
});
