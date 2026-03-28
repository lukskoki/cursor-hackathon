import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function VolunteerEventDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Event {id}</Text>
    </View>
  );
}
