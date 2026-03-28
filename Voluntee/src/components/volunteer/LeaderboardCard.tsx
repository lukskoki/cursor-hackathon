import { View, Text, StyleSheet } from "react-native";

type LeaderboardCardProps = { rank: number; name: string; points: number };

export function LeaderboardCard({ rank, name, points }: LeaderboardCardProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.rank}>{rank}</Text>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.points}>{points}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 10, gap: 12 },
  rank: { width: 28, fontWeight: "700" },
  name: { flex: 1 },
  points: { fontVariant: ["tabular-nums"] },
});
