import { useCallback, useEffect, useState } from "react";
import {
  getLeaderboard,
  type LeaderboardEntry,
} from "@/services/volunteer/leaderboard/leaderboardService";

export function useLeaderboard(limit: number = 20) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLeaderboard(limit);
      setEntries(data);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { entries, loading, error, refetch: fetch };
}
