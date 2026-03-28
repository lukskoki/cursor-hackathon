import { View, Text, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLeaderboard } from "@/hooks/volunteer/leaderboard/useLeaderboard";

export default function VolunteerLeaderboard() {
  const { entries, loading, error } = useLeaderboard();

  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.heading}>Leaderboard</Text>
      <FlatList
        data={entries}
        keyExtractor={(i) => i.uid}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color="#208AEF" style={{ marginTop: 40 }} />
          ) : error ? (
            <Text style={styles.emptyText}>Failed to load leaderboard.</Text>
          ) : (
            <Text style={styles.emptyText}>No volunteers yet.</Text>
          )
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.rank}>#{item.rank}</Text>
            <Text style={styles.name}>{item.displayName}</Text>
            <Text style={styles.points}>{item.points} pts</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  heading: { fontSize: 24, fontWeight: "700", paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  list: { paddingHorizontal: 20, gap: 6 },
  emptyText: { textAlign: "center", color: "#888", fontSize: 15, marginTop: 40 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  rank: { width: 36, fontSize: 16, fontWeight: "700", color: "#208AEF" },
  name: { flex: 1, fontSize: 16 },
  points: { fontSize: 14, fontWeight: "600", color: "#555" },
});
