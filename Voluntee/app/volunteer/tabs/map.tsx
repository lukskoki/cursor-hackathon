import { StyleSheet, ActivityIndicator, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView from "react-native-maps";
import { router } from "expo-router";

import { useVolunteerMap } from "@/hooks/volunteer/map/useVolunteerMap";
import { MapHeader } from "@/components/volunteer/map/MapHeader";
import { CategoryFilters } from "@/components/volunteer/map/CategoryFilters";
import { EventMarker } from "@/components/volunteer/map/EventMarker";
import { NearbySheet } from "@/components/volunteer/map/NearbySheet";

export default function VolunteerMap() {
  const {
    events,
    loading,
    region,
    radiusKm,
    selectedCategory,
    selectedEventId,
    searchQuery,
    setCategory,
    selectEvent,
    setSearch,
  } = useVolunteerMap();

  const handleEventPress = (id: string) => {
    router.push(`/volunteer/events/${id}`);
  };

  return (
    <View style={styles.root}>
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={region}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {events.map((evt) => (
          <EventMarker
            key={evt.id}
            latitude={evt.latitude}
            longitude={evt.longitude}
            category={evt.category}
            isSelected={evt.id === selectedEventId}
            onPress={() => selectEvent(evt.id)}
          />
        ))}
      </MapView>

      {loading && (
        <View style={styles.loader} pointerEvents="none">
          <ActivityIndicator color="#208AEF" size="small" />
        </View>
      )}

      <SafeAreaView edges={["top"]} style={styles.overlay} pointerEvents="box-none">
        <MapHeader
          searchQuery={searchQuery}
          onSearchChange={setSearch}
        />
        <CategoryFilters selected={selectedCategory} onSelect={setCategory} />
      </SafeAreaView>

      <NearbySheet
        events={events}
        radiusKm={radiusKm}
        loading={loading}
        searchQuery={searchQuery}
        onEventPress={handleEventPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
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
