import { View, Text, StyleSheet } from "react-native";

type EventCardProps = { title: string; subtitle?: string };

export function EventCard({ title, subtitle }: EventCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: 12, backgroundColor: "#f5f5f5" },
  title: { fontSize: 16, fontWeight: "600" },
  sub: { marginTop: 4, color: "#666" },
});
