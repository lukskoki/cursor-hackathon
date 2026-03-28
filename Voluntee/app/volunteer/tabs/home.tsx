import { View, Text, StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFirebaseStatus } from "@/hooks/shared/useFirebaseStatus";

const MOCK_EVENTS = [
  { id: "1", title: "Park cleanup", category: "Environment", location: "Maksimir, Zagreb", points: 15 },
  { id: "2", title: "Dog shelter help", category: "Animals", location: "Dumovec, Zagreb", points: 20 },
  { id: "3", title: "Elderly visit", category: "Social", location: "Tresnjevka, Zagreb", points: 10 },
  { id: "4", title: "Food bank sorting", category: "Community", location: "Centar, Zagreb", points: 25 },
];

export default function VolunteerHome() {
  const fb = useFirebaseStatus();

  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.heading}>Discover events</Text>
      {__DEV__ ? <FirebaseDevBanner status={fb} /> : null}
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

function FirebaseDevBanner({
  status,
}: {
  status: ReturnType<typeof useFirebaseStatus>;
}) {
  let text = "Firebase: …";
  let tone: "ok" | "warn" | "err" = "warn";
  if (status.kind === "loading") {
    text = "Firebase: provjera…";
  } else if (status.kind === "missing_env") {
    text = "Firebase: nema EXPO_PUBLIC_* u .env";
    tone = "err";
  } else if (status.kind === "ok") {
    text = `Firebase: SDK OK · projekt ${status.projectId}`;
    tone = "ok";
  } else if (status.kind === "error") {
    text = `Firebase: greška · ${status.message}`;
    tone = "err";
  }
  return (
    <View
      style={[
        styles.fbBanner,
        tone === "ok" && styles.fbOk,
        tone === "warn" && styles.fbWarn,
        tone === "err" && styles.fbErr,
      ]}
    >
      <Text style={styles.fbText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  heading: { fontSize: 24, fontWeight: "700", paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  fbBanner: {
    marginHorizontal: 20,
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  fbOk: { backgroundColor: "#E8F5E9" },
  fbWarn: { backgroundColor: "#FFF8E1" },
  fbErr: { backgroundColor: "#FFEBEE" },
  fbText: { fontSize: 12, color: "#333" },
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
