import { View, Text, StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MOCK = [
  { id: "1", rank: 1, name: "Ana K.", points: 340 },
  { id: "2", rank: 2, name: "Marko P.", points: 290 },
  { id: "3", rank: 3, name: "Ivana S.", points: 255 },
  { id: "4", rank: 4, name: "Luka M.", points: 210 },
  { id: "5", rank: 5, name: "Petra Z.", points: 180 },
];

export default function VolunteerLeaderboard() {
  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.heading}>Leaderboard</Text>
      <FlatList
        data={MOCK}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.rank}>#{item.rank}</Text>
            <Text style={styles.name}>{item.name}</Text>
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
