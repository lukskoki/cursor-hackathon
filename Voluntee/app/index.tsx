import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Redirect } from "expo-router";
import { useAuthStore } from "@/store/authStore";

export default function Index() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const user = useAuthStore((s) => s.user);

  if (!hydrated) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color="#208AEF" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/shared/onboarding/welcome" />;
  }

  if (user.role === "organization") {
    return <Redirect href="/organization/tabs/dashboard" />;
  }

  return <Redirect href="/volunteer/tabs/home" />;
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
