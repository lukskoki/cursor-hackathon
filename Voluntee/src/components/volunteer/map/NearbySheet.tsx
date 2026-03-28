import { useRef, useEffect, useState, useCallback, type ReactNode } from "react";
import { View, Text, StyleSheet, FlatList, Animated, Dimensions } from "react-native";
import type { MapEvent } from "@/services/volunteer/map/volunteerMapService";
import type { VolunteerEvent } from "@/types/volunteer/event";
import { NearbyEventCard } from "./NearbyEventCard";
import { EventDetailView } from "./EventDetailView";
import { DraggableSheet, type DraggableSheetRef } from "./DraggableSheet";

type Props = {
  events: MapEvent[];
  radiusKm: number;
  loading: boolean;
  searchQuery: string;
  onEventPress: (id: string) => void;
  floatingButton?: ReactNode;
  selectedEvent: VolunteerEvent | null;
  onBack: () => void;
  onApply: (id: string) => void;
};

export function NearbySheet({
  events,
  radiusKm,
  loading,
  searchQuery,
  onEventPress,
  floatingButton,
  selectedEvent,
  onBack,
  onApply,
}: Props) {
  const sheetRef = useRef<DraggableSheetRef>(null);
  const screenW = Dimensions.get("window").width;
  const slideAnim = useRef(new Animated.Value(screenW)).current;
  const [visibleEvent, setVisibleEvent] = useState<VolunteerEvent | null>(null);

  useEffect(() => {
    if (selectedEvent) {
      setVisibleEvent(selectedEvent);
      slideAnim.setValue(screenW);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }).start();
    }
  }, [selectedEvent, slideAnim, screenW]);

  const handleEventPress = (id: string) => {
    onEventPress(id);
    setTimeout(() => sheetRef.current?.snapTo(0), 50);
  };

  const handleBack = useCallback(() => {
    sheetRef.current?.snapTo(1);
    Animated.timing(slideAnim, {
      toValue: screenW,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setVisibleEvent(null);
      onBack();
    });
  }, [slideAnim, screenW, onBack]);

  const headerText = searchQuery
    ? `${events.length} result${events.length === 1 ? "" : "s"} for "${searchQuery}"`
    : `${events.length} opportunit${events.length === 1 ? "y" : "ies"} within ${radiusKm}km`;

  return (
    <DraggableSheet
      ref={sheetRef}
      floatingButton={floatingButton}
      header={
        !visibleEvent ? (
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Text style={styles.sectionTitle}>Nearby Activities</Text>
              <Text style={styles.subtitle}>{headerText}</Text>
            </View>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveTxt}>Live</Text>
            </View>
          </View>
        ) : undefined
      }
    >
      {visibleEvent ? (
        <Animated.View style={{ flex: 1, transform: [{ translateX: slideAnim }] }}>
          <EventDetailView
            event={visibleEvent}
            onBack={handleBack}
            onApply={onApply}
          />
        </Animated.View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(e) => e.id}
          renderItem={({ item }) => (
            <NearbyEventCard event={item} onPress={handleEventPress} />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTxt}>
                {loading ? "Loading..." : "No activities found"}
              </Text>
            </View>
          }
        />
      )}
    </DraggableSheet>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 2,
    paddingBottom: 14,
  },
  headerLeft: { flex: 1, gap: 2 },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: "#111" },
  subtitle: { fontSize: 13, color: "#888" },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#EDF5FF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#208AEF",
  },
  liveTxt: { fontSize: 11, fontWeight: "600", color: "#208AEF" },
  list: { paddingHorizontal: 20, gap: 10, paddingBottom: 160 },
  empty: { paddingTop: 40, alignItems: "center" },
  emptyTxt: { fontSize: 15, color: "#aaa" },
});
