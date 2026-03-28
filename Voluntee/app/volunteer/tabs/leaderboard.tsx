import { useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLeaderboard } from "@/hooks/volunteer/leaderboard/useLeaderboard";

type Tab = "global" | "monthly" | "city";

const TABS: { key: Tab; label: string }[] = [
  { key: "global", label: "Global" },
  { key: "monthly", label: "Monthly" },
  { key: "city", label: "City" },
];

export default function VolunteerLeaderboard() {
  const { entries, loading, error } = useLeaderboard();
  const [activeTab, setActiveTab] = useState<Tab>("global");

  const getSubtitle = () => {
    switch (activeTab) {
      case "monthly":
        return "Top volunteers this month";
      case "city":
        return "Top volunteers in Zagreb";
      default:
        return "All-time top volunteers";
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.heading}>Leaderboard</Text>

      <View style={styles.tabs}>
        {TABS.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.subtitle}>{getSubtitle()}</Text>

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
            <View
              style={[
                styles.rankBadge,
                item.rank <= 3 && styles.rankBadgeTop,
              ]}
            >
              <Text
                style={[
                  styles.rankText,
                  item.rank <= 3 && styles.rankTextTop,
                ]}
              >
                {item.rank}
              </Text>
            </View>
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
  heading: {
    fontSize: 24,
    fontWeight: "700",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  tabs: {
    flexDirection: "row",
    marginHorizontal: 20,
    backgroundColor: "#f2f2f2",
    borderRadius: 12,
    padding: 3,
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: "#208AEF",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#888",
  },
  tabTextActive: {
    color: "#fff",
  },
  subtitle: {
    fontSize: 13,
    color: "#888",
    paddingHorizontal: 24,
    marginBottom: 6,
  },
  list: { paddingHorizontal: 20, gap: 6 },
  emptyText: { textAlign: "center", color: "#888", fontSize: 15, marginTop: 40 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f2f2f2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  rankBadgeTop: {
    backgroundColor: "#208AEF",
  },
  rankText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#555",
  },
  rankTextTop: {
    color: "#fff",
  },
  name: { flex: 1, fontSize: 16 },
  points: { fontSize: 14, fontWeight: "600", color: "#555" },
});
