export type VolunteerProfileBadge = {
  id: string;
  name: string;
  unlocked: boolean;
  icon: "footprints" | "helper" | "leaf" | "leader";
};

export type VolunteerPastActivity = {
  id: string;
  category: string;
  timeAgo: string;
  title: string;
  points: number;
  accent: "primary" | "muted";
  leftLabel: string;
  leftValue: string;
  rightLabel: string;
  rightValue: string;
};

export type VolunteerProfileReview = {
  id: string;
  authorName: string;
  body: string;
  rating: number;
};

export type VolunteerInterest = {
  id: string;
  label: string;
};

export type VolunteerProfileDetail = {
  appName: string;
  displayName: string;
  location: string;
  bio: string;
  avatarUrl: string;
  totalPoints: number;
  eventsCompleted: number;
  impactHours: number;
  badges: VolunteerProfileBadge[];
  pastActivities: VolunteerPastActivity[];
  reviews: VolunteerProfileReview[];
  interests: VolunteerInterest[];
};
