import { ActivityIndicator, View, StyleSheet } from "react-native";

export function Loader() {
  return (
    <View style={styles.wrap}>
      <ActivityIndicator size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: "center", alignItems: "center" },
});
