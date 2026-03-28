import { View, StyleSheet } from "react-native";
import { Marker } from "react-native-maps";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { EventCategory } from "@/types/volunteer/event";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const CATEGORY_ICONS: Record<EventCategory, IconName> = {
  environment: "leaf",
  social: "people",
  animals: "paw",
  community: "heart",
  education: "book",
};

type Props = {
  latitude: number;
  longitude: number;
  category: EventCategory;
  isSelected: boolean;
  onPress: () => void;
};

export function EventMarker({
  latitude,
  longitude,
  category,
  isSelected,
  onPress,
}: Props) {
  return (
    <Marker coordinate={{ latitude, longitude }} onPress={onPress}>
      <View style={[styles.pin, isSelected && styles.pinSelected]}>
        <Ionicons
          name={CATEGORY_ICONS[category]}
          size={16}
          color="#fff"
        />
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  pin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#208AEF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  pinSelected: {
    backgroundColor: "#0B5FBF",
    transform: [{ scale: 1.2 }],
  },
});
