import type { VolunteerProfileDetail } from "@/types/volunteer/profile";

const MOCK_PROFILE: VolunteerProfileDetail = {
  appName: "Kinetic Community",
  displayName: "Luka Radić",
  location: "Zagreb, Croatia",
  bio: "Passionate about urban gardening and youth mentorship. Believe that every small act ripples through the whole city. 🌿",
  avatarUrl:
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
  totalPoints: 12450,
  eventsCompleted: 42,
  impactHours: 156,
  badges: [
    { id: "1", name: "First Step", unlocked: true, icon: "footprints" },
    { id: "2", name: "Helper", unlocked: true, icon: "helper" },
    { id: "3", name: "Eco Warrior", unlocked: true, icon: "leaf" },
    { id: "4", name: "Leader", unlocked: false, icon: "leader" },
  ],
  pastActivities: [
    {
      id: "a1",
      category: "ENVIRONMENT",
      timeAgo: "2 DAYS AGO",
      title: "Maksimir Park Cleanup",
      points: 450,
      accent: "primary",
      leftLabel: "DURATION",
      leftValue: "3h 45m",
      rightLabel: "IMPACT",
      rightValue: "12kg Trash",
    },
    {
      id: "a2",
      category: "COMMUNITY",
      timeAgo: "1 WEEK AGO",
      title: "Digital Literacy Workshop",
      points: 800,
      accent: "muted",
      leftLabel: "STUDENTS",
      leftValue: "12 Seniors",
      rightLabel: "RATING",
      rightValue: "5.0 ★",
    },
  ],
  reviews: [
    {
      id: "r1",
      authorName: "Green Zagreb NGO",
      body: "Luka was punctual, proactive, and great with the team. Would recommend for any outdoor event.",
      rating: 5,
    },
    {
      id: "r2",
      authorName: "Youth Hub Zagreb",
      body: "Clear communication and positive energy throughout the workshop.",
      rating: 5,
    },
  ],
  interests: [
    { id: "i1", label: "Environment" },
    { id: "i2", label: "Education" },
    { id: "i3", label: "Community" },
    { id: "i4", label: "Youth mentorship" },
  ],
};

export const volunteerProfileService = {
  getProfile: async (): Promise<VolunteerProfileDetail> => {
    await new Promise((r) => setTimeout(r, 400));
    return MOCK_PROFILE;
  },
};
