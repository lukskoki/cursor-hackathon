import { useState, useEffect, useCallback } from "react";
import type { EventCategory } from "@/types/volunteer/event";
import {
  volunteerMapService,
  type MapEvent,
} from "@/services/volunteer/map/volunteerMapService";
import { ZAGREB_CENTER } from "@/services/volunteer/map/mockMapData";

const RADIUS_KM = 10;
const DEBOUNCE_MS = 300;

export function useVolunteerMap() {
  const [events, setEvents] = useState<MapEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] =
    useState<EventCategory | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchEvents = useCallback(
    async (cat: EventCategory | null, search: string) => {
      setLoading(true);
      try {
        const data = await volunteerMapService.getNearby({
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
    const timer = setTimeout(() => {
      fetchEvents(selectedCategory, searchQuery);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery, fetchEvents]);

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
    loading,
    region: ZAGREB_CENTER,
    radiusKm: RADIUS_KM,
    selectedCategory,
    selectedEventId,
    searchQuery,
    setCategory: handleCategoryChange,
    selectEvent: handleSelectEvent,
    setSearch: handleSearchChange,
  };
}
