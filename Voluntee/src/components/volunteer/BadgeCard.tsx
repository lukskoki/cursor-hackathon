import { View, Text, StyleSheet } from "react-native";

type BadgeCardProps = { name: string; description?: string };

export function BadgeCard({ name, description }: BadgeCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{name}</Text>
      {description ? <Text style={styles.desc}>{description}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: "#e0e0e0" },
  name: { fontWeight: "600" },
  desc: { marginTop: 4, fontSize: 13, color: "#666" },
});
