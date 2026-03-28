import { useRef, useCallback } from "react";
import { StyleSheet, ActivityIndicator, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { useVolunteerMap } from "@/hooks/volunteer/map/useVolunteerMap";
import { MapHeader } from "@/components/volunteer/map/MapHeader";
import { CategoryFilters } from "@/components/volunteer/map/CategoryFilters";
import { EventMarker } from "@/components/volunteer/map/EventMarker";
import { NearbySheet } from "@/components/volunteer/map/NearbySheet";

export default function VolunteerMap() {
  const mapRef = useRef<MapView>(null);
  const {
    events,
    loading,
    region,
    radiusKm,
    selectedCategory,
    selectedEventId,
    searchQuery,
    userLocation,
    setCategory,
    selectEvent,
    setSearch,
  } = useVolunteerMap();

  const handleCenterOnUser = useCallback(() => {
    if (!userLocation || !mapRef.current) return;
    mapRef.current.animateToRegion(
      { ...region, latitude: userLocation.latitude, longitude: userLocation.longitude },
      400,
    );
  }, [userLocation, region]);

  const handleEventPress = (id: string) => {
    router.push(`/volunteer/events/${id}`);
  };

  return (
    <View style={styles.root}>
      <MapView
        ref={mapRef}
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
        floatingButton={
          userLocation ? (
            <Pressable style={styles.locateBtn} onPress={handleCenterOnUser}>
              <Ionicons name="locate" size={22} color="#208AEF" />
            </Pressable>
          ) : undefined
        }
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
  locateBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
});
