import type { OrganizationEvent } from "@/types/organization/event";

export function canEdit(event: OrganizationEvent) {
  return Boolean(event.id);
}
