import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function OrganizationEventDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Organization event {id}</Text>
    </View>
  );
}
