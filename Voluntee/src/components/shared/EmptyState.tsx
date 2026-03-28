import { View, Text, StyleSheet } from "react-native";

type EmptyStateProps = { title: string; message?: string };

export function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.msg}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  title: { fontSize: 18, fontWeight: "600" },
  msg: { marginTop: 8, color: "#666", textAlign: "center" },
});
