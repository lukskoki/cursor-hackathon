import { useCallback, useEffect, useState } from "react";
import { reviewService } from "@/services/shared/reviewService";
import type { Review } from "@/types/shared/review";

export function useSubmitReview() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (review: Omit<Review, "id">) => {
    setLoading(true);
    setError(null);
    try {
      const id = await reviewService.submitReview(review);
      return id;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to submit review";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { submit, loading, error };
}

export function useMyReviews(userId: string | undefined) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await reviewService.getReviewsByUser(userId);
      setReviews(data);
    } catch {
      /* best-effort */
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { reviews, loading, refresh: fetch };
}

export function useReceivedReviews(userId: string | undefined) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await reviewService.getReviewsForUser(userId);
      setReviews(data);
    } catch {
      /* best-effort */
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { reviews, loading, refresh: fetch };
}
