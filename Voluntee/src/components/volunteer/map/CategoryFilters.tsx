import { ScrollView, Pressable, Text, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  ALL_CATEGORIES,
  CATEGORY_LABELS,
  type EventCategory,
} from "@/types/volunteer/event";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const CATEGORY_ICONS: Record<EventCategory, IconName> = {
  environment: "leaf-outline",
  social: "people-outline",
  animals: "paw-outline",
  community: "heart-outline",
  education: "book-outline",
};

type Props = {
  selected: EventCategory | null;
  onSelect: (cat: EventCategory | null) => void;
};

export function CategoryFilters({ selected, onSelect }: Props) {
  const isAll = selected === null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      <Pressable
        style={[styles.chip, isAll && styles.chipActive]}
        onPress={() => onSelect(null)}
      >
        <Ionicons
          name="funnel-outline"
          size={14}
          color={isAll ? "#fff" : "#555"}
        />
        <Text style={[styles.chipTxt, isAll && styles.chipTxtActive]}>All</Text>
      </Pressable>

      {ALL_CATEGORIES.map((cat) => {
        const active = selected === cat;
        return (
          <Pressable
            key={cat}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => onSelect(active ? null : cat)}
          >
            <Ionicons
              name={CATEGORY_ICONS[cat]}
              size={14}
              color={active ? "#fff" : "#555"}
            />
            <Text style={[styles.chipTxt, active && styles.chipTxtActive]}>
              {CATEGORY_LABELS[cat]}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: 16, gap: 8, paddingBottom: 6 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.92)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  chipActive: {
    backgroundColor: "#208AEF",
    shadowOpacity: 0.12,
  },
  chipTxt: { fontSize: 13, fontWeight: "500", color: "#555" },
  chipTxtActive: { color: "#fff" },
});
