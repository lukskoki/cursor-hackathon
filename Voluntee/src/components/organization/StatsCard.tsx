import { View, Text, StyleSheet } from "react-native";

type StatsCardProps = { label: string; value: string | number };

export function StatsCard({ label, value }: StatsCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: 12, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e8e8e8" },
  value: { fontSize: 22, fontWeight: "700" },
  label: { marginTop: 4, fontSize: 13, color: "#666" },
});
