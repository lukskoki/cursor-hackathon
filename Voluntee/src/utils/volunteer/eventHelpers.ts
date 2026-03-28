import type { VolunteerEvent } from "@/types/volunteer/event";

export function isUpcoming(event: VolunteerEvent) {
  return new Date(event.startsAt) > new Date();
}
