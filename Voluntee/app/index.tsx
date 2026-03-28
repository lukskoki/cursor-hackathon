import { ActivityIndicator, View, StyleSheet } from "react-native";
import { Redirect } from "expo-router";
import { useAuthStore } from "@/store/authStore";

export default function Index() {
  const { authInitialized, isLoggedIn, role } = useAuthStore();

  if (!authInitialized) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color="#208AEF" />
      </View>
    );
  }

  if (!isLoggedIn) {
    return <Redirect href="/shared/auth/login" />;
  }

  if (role === "organization") {
    return <Redirect href="/organization/tabs/dashboard" />;
  }

  return <Redirect href="/volunteer/tabs/home" />;
}

const styles = StyleSheet.create({
  boot: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
});
