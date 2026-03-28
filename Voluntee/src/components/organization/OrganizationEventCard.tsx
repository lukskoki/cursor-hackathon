import { View, Text, StyleSheet } from "react-native";

type OrganizationEventCardProps = { title: string; dateLabel?: string };

export function OrganizationEventCard({ title, dateLabel }: OrganizationEventCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {dateLabel ? <Text style={styles.date}>{dateLabel}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: 12, backgroundColor: "#eef6ff" },
  title: { fontSize: 16, fontWeight: "600" },
  date: { marginTop: 6, color: "#444" },
});
