import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { authService } from "@/services/shared/authService";
import { useAuthStore } from "@/store/authStore";

export default function VolunteerProfile() {
  const email = useAuthStore((s) => s.user?.email ?? "");

  const handleLogout = async () => {
    await authService.signOutUser();
    useAuthStore.getState().setUser(null);
    router.replace("/");
  };

  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.heading}>Profile</Text>

      <View style={styles.avatar}>
        <Text style={styles.avatarTxt}>{(email ?? "V")[0].toUpperCase()}</Text>
      </View>

      <Text style={styles.email}>{email}</Text>

      <View style={styles.stats}>
        <Stat label="Points" value="0" />
        <Stat label="Events" value="0" />
        <Stat label="Badges" value="0" />
      </View>

      <Pressable style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutTxt}>Log out</Text>
      </Pressable>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statVal}>{value}</Text>
      <Text style={styles.statLbl}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff", alignItems: "center", paddingTop: 12 },
  heading: { fontSize: 24, fontWeight: "700", alignSelf: "flex-start", paddingHorizontal: 20, marginBottom: 24 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#208AEF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarTxt: { color: "#fff", fontSize: 32, fontWeight: "700" },
  email: { fontSize: 15, color: "#666", marginBottom: 24 },
  stats: { flexDirection: "row", gap: 32, marginBottom: 40 },
  stat: { alignItems: "center" },
  statVal: { fontSize: 22, fontWeight: "700" },
  statLbl: { fontSize: 13, color: "#888", marginTop: 2 },
  logoutBtn: {
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#e53e3e",
  },
  logoutTxt: { color: "#e53e3e", fontSize: 15, fontWeight: "600" },
});
