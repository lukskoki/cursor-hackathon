import { View, Text, StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MOCK_EVENTS = [
  { id: "1", title: "Park cleanup", category: "Environment", location: "Maksimir, Zagreb", points: 15 },
  { id: "2", title: "Dog shelter help", category: "Animals", location: "Dumovec, Zagreb", points: 20 },
  { id: "3", title: "Elderly visit", category: "Social", location: "Tresnjevka, Zagreb", points: 10 },
  { id: "4", title: "Food bank sorting", category: "Community", location: "Centar, Zagreb", points: 25 },
];

export default function VolunteerHome() {
  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.heading}>Discover events</Text>
      <FlatList
        data={MOCK_EVENTS}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.badge}>
              <Text style={styles.badgeTxt}>{item.category}</Text>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.location}>{item.location}</Text>
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
  list: { paddingHorizontal: 20, gap: 12, paddingBottom: 20 },
  card: {
    backgroundColor: "#f8f9fa",
    borderRadius: 14,
    padding: 16,
    gap: 6,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#EDF5FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeTxt: { fontSize: 12, color: "#208AEF", fontWeight: "600" },
  title: { fontSize: 17, fontWeight: "600" },
  location: { fontSize: 13, color: "#666" },
  points: { fontSize: 13, color: "#208AEF", fontWeight: "600" },
});
