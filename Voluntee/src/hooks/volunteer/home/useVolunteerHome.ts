import { useRecommendedEvents } from "./useRecommendedEvents";

export function useVolunteerHome() {
  const { events, loading, error, refetch } = useRecommendedEvents();
  return { data: events, loading, error, refetch };
}
