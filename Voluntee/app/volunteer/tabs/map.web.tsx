import { useState } from "react";
import { StyleSheet, ActivityIndicator, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import type { VolunteerEvent } from "@/types/volunteer/event";
import { useVolunteerMap } from "@/hooks/volunteer/map/useVolunteerMap";
import { MapHeader } from "@/components/volunteer/map/MapHeader";
import { CategoryFilters } from "@/components/volunteer/map/CategoryFilters";
import { NearbySheet } from "@/components/volunteer/map/NearbySheet";

/**
 * Web override for `map.tsx` (react-native-maps is not supported on web).
 * Reuse search, filters, and the bottom sheet so the volunteer flow still works in the browser.
 */
export default function VolunteerMapWeb() {
  const [selectedEvent, setSelectedEvent] = useState<VolunteerEvent | null>(null);
  const {
    events,
    loading,
    radiusKm,
    selectedCategory,
    selectedEventId,
    searchQuery,
    setCategory,
    setSearch,
  } = useVolunteerMap();

  const handleEventPress = (id: string) => {
    const evt = events.find((e) => e.id === id);
    if (evt) setSelectedEvent(evt);
  };

  const handleDetailBack = () => setSelectedEvent(null);

  const handleApply = (id: string) => {
    router.push(`/volunteer/events/apply?id=${id}`);
  };

  const highlightId = selectedEvent?.id ?? selectedEventId;

  return (
    <View style={styles.root}>
      <View style={styles.mapPlaceholder} pointerEvents="none">
        <Text style={styles.mapHint}>Map preview</Text>
        <Text style={styles.mapSub}>
          The live map runs on iOS and Android. On web, use search and the list below.
        </Text>
        {highlightId ? (
          <Text style={styles.mapSub} numberOfLines={2}>
            Selected: {events.find((e) => e.id === highlightId)?.title ?? highlightId}
          </Text>
        ) : null}
      </View>

      {loading && (
        <View style={styles.loader} pointerEvents="none">
          <ActivityIndicator color="#208AEF" size="small" />
        </View>
      )}

      <SafeAreaView edges={["top"]} style={styles.overlay} pointerEvents="box-none">
        <MapHeader searchQuery={searchQuery} onSearchChange={setSearch} />
        <CategoryFilters selected={selectedCategory} onSelect={setCategory} />
      </SafeAreaView>

      <NearbySheet
        events={events}
        radiusKm={radiusKm}
        loading={loading}
        searchQuery={searchQuery}
        onEventPress={handleEventPress}
        selectedEvent={selectedEvent}
        onBack={handleDetailBack}
        onApply={handleApply}
        floatingButton={undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  mapPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#E8EEF4",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  mapHint: {
    fontSize: 15,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 8,
  },
  mapSub: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  loader: {
    position: "absolute",
    top: "50%",
    alignSelf: "center",
    zIndex: 5,
  },
});
