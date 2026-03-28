export type OrganizerDashboardStats = {
  totalVolunteersReached: number;
  volunteersTrendPercent: number;
  eventsHeld: number;
  eventsPending: number;
  impactScore: string;
  impactRankLabel: string;
};

export type OrganizerApplication = {
  id: string;
  name: string;
  avatarUrl: string;
  eventName: string;
  appliedAtLabel: string;
};

export type ActiveOrganizerEventInProgress = {
  id: string;
  kind: "in_progress";
  title: string;
  joined: number;
  capacity: number;
  /** Remote cover from `events.cover_image_url`; UI may fall back to a local asset. */
  coverImageUrl?: string | null;
};

export type ActiveOrganizerEventUpcoming = {
  id: string;
  kind: "upcoming";
  title: string;
  startsInLabel: string;
  signedUpExtra: number;
  participantAvatarUrls: string[];
};

export type ActiveOrganizerEvent = ActiveOrganizerEventInProgress | ActiveOrganizerEventUpcoming;

export type OrganizerDashboardData = {
  organizationName: string;
  locationSubtitle: string;
  stats: OrganizerDashboardStats;
  applications: OrganizerApplication[];
  activeEvents: ActiveOrganizerEvent[];
};
