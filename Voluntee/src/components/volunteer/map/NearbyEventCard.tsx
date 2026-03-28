import { View, Text, Pressable, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { MapEvent } from "@/services/volunteer/map/volunteerMapService";
import {
  CATEGORY_LABELS,
  type EventCategory,
} from "@/types/volunteer/event";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const CAT_ICON: Record<EventCategory, IconName> = {
  environment: "leaf",
  social: "people",
  animals: "paw",
  community: "heart",
  education: "book",
};

type Props = {
  event: MapEvent;
  onPress: (id: string) => void;
};

export function NearbyEventCard({ event, onPress }: Props) {
  return (
    <Pressable style={styles.card} onPress={() => onPress(event.id)}>
      <View style={styles.iconWrap}>
        <Ionicons name={CAT_ICON[event.category]} size={20} color="#208AEF" />
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {event.title}
        </Text>
        <Text style={styles.address} numberOfLines={1}>
          {event.address}
        </Text>
      </View>

      <View style={styles.right}>
        <Text style={styles.dist}>
          {event.distanceKm < 1
            ? `${Math.round(event.distanceKm * 1000)} m`
            : `${event.distanceKm.toFixed(1)} km`}
        </Text>
        <Text style={styles.distLabel}>away</Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color="#bbb" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#EDF5FF",
    justifyContent: "center",
    alignItems: "center",
  },
  body: { flex: 1, gap: 2 },
  title: { fontSize: 15, fontWeight: "600", color: "#111" },
  address: { fontSize: 12, color: "#888" },
  right: { alignItems: "flex-end", marginRight: 2 },
  dist: { fontSize: 13, fontWeight: "600", color: "#333" },
  distLabel: { fontSize: 11, color: "#999" },
});
