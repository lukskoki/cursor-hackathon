import { useState, useEffect, useCallback, useMemo } from "react";
import * as Location from "expo-location";
import type { EventCategory } from "@/types/volunteer/event";
import {
  volunteerMapService,
  type MapEvent,
} from "@/services/volunteer/map/volunteerMapService";
import { ZAGREB_CENTER } from "@/services/volunteer/map/mockMapData";

const RADIUS_KM = 10;
const DEBOUNCE_MS = 300;

type UserLocation = {
  latitude: number;
  longitude: number;
};

export function useVolunteerMap() {
  const [events, setEvents] = useState<MapEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] =
    useState<EventCategory | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLocationLoading(false);
          return;
        }

        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (!cancelled) {
          setUserLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
        }
      } finally {
        if (!cancelled) setLocationLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const defaultCoords = useMemo(
    () => ({
      latitude: ZAGREB_CENTER.latitude,
      longitude: ZAGREB_CENTER.longitude,
    }),
    [],
  );

  const coords = userLocation ?? defaultCoords;

  const region = {
    latitude: coords.latitude,
    longitude: coords.longitude,
    latitudeDelta: ZAGREB_CENTER.latitudeDelta,
    longitudeDelta: ZAGREB_CENTER.longitudeDelta,
  };

  const fetchEvents = useCallback(
    async (
      cat: EventCategory | null,
      search: string,
      loc: UserLocation,
    ) => {
      setLoading(true);
      try {
        const data = await volunteerMapService.getNearby({
          userLat: loc.latitude,
          userLon: loc.longitude,
          category: cat,
          search,
          radiusKm: RADIUS_KM,
        });
        setEvents(data);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (locationLoading) return;

    const timer = setTimeout(() => {
      fetchEvents(selectedCategory, searchQuery, coords);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery, coords, locationLoading, fetchEvents]);

  const handleCategoryChange = useCallback((cat: EventCategory | null) => {
    setSelectedCategory(cat);
    setSelectedEventId(null);
  }, []);

  const handleSelectEvent = useCallback((id: string) => {
    setSelectedEventId((prev) => (prev === id ? null : id));
  }, []);

  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
    setSelectedEventId(null);
  }, []);

  return {
    events,
    loading: loading || locationLoading,
    region,
    radiusKm: RADIUS_KM,
    selectedCategory,
    selectedEventId,
    searchQuery,
    userLocation,
    hasLocationPermission: userLocation !== null,
    setCategory: handleCategoryChange,
    selectEvent: handleSelectEvent,
    setSearch: handleSearchChange,
  };
}
