import { View, Text, StyleSheet } from "react-native";

type ApplicantCardProps = { name: string; status?: string };

export function ApplicantCard({ name, status }: ApplicantCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{name}</Text>
      {status ? <Text style={styles.status}>{status}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 14, borderRadius: 10, backgroundColor: "#f5f5f5" },
  name: { fontWeight: "600" },
  status: { marginTop: 4, fontSize: 13, color: "#555" },
});
