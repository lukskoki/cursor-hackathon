import { useState, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import {
  organizationEventsService,
  type CreateEventInput,
} from "@/services/organization/events/organizationEventsService";

export function useCreateEvent() {
  const user = useAuthStore((s) => s.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const create = useCallback(
    async (formData: Omit<CreateEventInput, "organizerId" | "organizerName" | "createdAt">) => {
      if (!user) {
        setError("Not authenticated");
        return null;
      }

      const organizerName =
        user.role === "organization" ? user.organizationName : user.email;

      setLoading(true);
      setError(null);
      setSuccess(false);

      try {
        const id = await organizationEventsService.createEvent({
          ...formData,
          organizerId: user.id,
          organizerName,
          createdAt: new Date().toISOString(),
        });
        setSuccess(true);
        return id;
      } catch (e: any) {
        setError(e?.message ?? "Failed to create event");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  return { create, loading, error, success };
}
