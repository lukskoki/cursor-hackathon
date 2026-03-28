import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function VolunteerNotifications() {
  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.heading}>Notifications</Text>
      <View style={styles.empty}>
        <Text style={styles.emptyTxt}>No notifications yet</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  heading: { fontSize: 24, fontWeight: "700", paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  empty: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyTxt: { color: "#aaa", fontSize: 16 },
});
