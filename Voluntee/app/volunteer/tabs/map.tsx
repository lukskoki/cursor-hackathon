import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function VolunteerMap() {
  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.heading}>Map</Text>
      <View style={styles.placeholder}>
        <Text style={styles.placeholderTxt}>Map view goes here</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  heading: { fontSize: 24, fontWeight: "700", paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  placeholder: { flex: 1, justifyContent: "center", alignItems: "center" },
  placeholderTxt: { color: "#aaa", fontSize: 16 },
});
