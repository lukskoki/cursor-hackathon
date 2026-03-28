import type { OrganizerDashboardData } from "@/types/organization/dashboard";

const BASE_MOCK: OrganizerDashboardData = {
  organizationName: "Kinetic Community",
  locationSubtitle: "Manage your community impact in Zagreb.",
  stats: {
    totalVolunteersReached: 1248,
    volunteersTrendPercent: 12,
    eventsHeld: 42,
    eventsPending: 6,
    impactScore: "9.4",
    impactRankLabel: "Top 5% in Zagreb",
  },
  applications: [
    {
      id: "app-1",
      name: "Marta Kovač",
      avatarUrl: "https://i.pravatar.cc/128?img=5",
      eventName: "Jarun Lake Cleanup",
      appliedAtLabel: "2h ago",
    },
    {
      id: "app-2",
      name: "Luka Brkić",
      avatarUrl: "https://i.pravatar.cc/128?img=12",
      eventName: "Community Food Drive",
      appliedAtLabel: "4h ago",
    },
    {
      id: "app-3",
      name: "Ana Horvat",
      avatarUrl: "https://i.pravatar.cc/128?img=9",
      eventName: "Jarun Lake Cleanup",
      appliedAtLabel: "1d ago",
    },
  ],
  activeEvents: [
    {
      id: "ev-1",
      kind: "in_progress",
      title: "Jarun Lake Cleanup",
      joined: 28,
      capacity: 30,
      coverImageUrl:
        "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80",
    },
    {
      id: "ev-15",
      kind: "in_progress",
      title: "Zrinjevac Reading Nook",
      joined: 14,
      capacity: 20,
      coverImageUrl:
        "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=800&q=80",
    },
    {
      id: "ev-2",
      kind: "upcoming",
      title: "Community Food Drive",
      startsInLabel: "Starts in 3 days",
      signedUpExtra: 12,
      participantAvatarUrls: [
        "https://i.pravatar.cc/128?img=14",
        "https://i.pravatar.cc/128?img=33",
        "https://i.pravatar.cc/128?img=47",
      ],
    },
    {
      id: "ev-3",
      kind: "upcoming",
      title: "Shelter Dog Walk",
      startsInLabel: "Starts tomorrow · 08:30",
      signedUpExtra: 8,
      participantAvatarUrls: [
        "https://i.pravatar.cc/128?img=21",
        "https://i.pravatar.cc/128?img=52",
        "https://i.pravatar.cc/128?img=68",
      ],
    },
    {
      id: "ev-7",
      kind: "upcoming",
      title: "Senior Tech Help Desk",
      startsInLabel: "Starts in 5 days",
      signedUpExtra: 5,
      participantAvatarUrls: [
        "https://i.pravatar.cc/128?img=3",
        "https://i.pravatar.cc/128?img=8",
        "https://i.pravatar.cc/128?img=19",
      ],
    },
  ],
  allEvents: [
    {
      id: "ev-1",
      title: "Jarun Lake Cleanup",
      status: "in_progress",
      detailLabel: "28 / 30 volunteers · Today 09:00",
    },
    {
      id: "ev-15",
      title: "Zrinjevac Reading Nook",
      status: "in_progress",
      detailLabel: "14 / 20 volunteers · Today 11:00",
    },
    {
      id: "ev-2",
      title: "Community Food Drive",
      status: "upcoming",
      detailLabel: "Sun, Mar 22 · 10:00 · Trg bana Jelačića",
    },
    {
      id: "ev-3",
      title: "Shelter Dog Walk",
      status: "upcoming",
      detailLabel: "Sat, Mar 28 · 08:30 · Zagreb Animal Shelter",
    },
    {
      id: "ev-4",
      title: "Riverbank Tree Planting",
      status: "draft",
      detailLabel: "Draft · Apr 5 · Sava embankment",
    },
    {
      id: "ev-5",
      title: "Winter Coat Collection",
      status: "completed",
      detailLabel: "Completed · Feb 2025 · 48 volunteers",
    },
    {
      id: "ev-6",
      title: "Youth Coding Workshop",
      status: "cancelled",
      detailLabel: "Cancelled · Venue unavailable",
    },
    {
      id: "ev-7",
      title: "Senior Tech Help Desk",
      status: "upcoming",
      detailLabel: "Wed, Apr 2 · 14:00 · Maksimir Library",
    },
    {
      id: "ev-8",
      title: "Blood Donation Drive",
      status: "upcoming",
      detailLabel: "Fri, Apr 4 · 09:00–15:00 · KB Merkur",
    },
    {
      id: "ev-9",
      title: "Maksimir Park Trail Repair",
      status: "draft",
      detailLabel: "Draft · Apr 12 · Tools provided",
    },
    {
      id: "ev-10",
      title: "ESL Conversation Circle",
      status: "upcoming",
      detailLabel: "Tue weekly · 18:30 · Online",
    },
    {
      id: "ev-11",
      title: "Christmas Toy Sorting",
      status: "completed",
      detailLabel: "Completed · Dec 2025 · 62 volunteers",
    },
    {
      id: "ev-12",
      title: "Bike Repair Pop-up",
      status: "completed",
      detailLabel: "Completed · Mar 8 · 19 bikes fixed",
    },
    {
      id: "ev-13",
      title: "River Kayak Litter Pick",
      status: "cancelled",
      detailLabel: "Cancelled · High water level",
    },
    {
      id: "ev-14",
      title: "Community Garden Kickoff",
      status: "upcoming",
      detailLabel: "Sat, Apr 19 · 07:00 · Trešnjevka plots",
    },
  ],
};

const dismissedApplicationIds = new Set<string>();

export function getMockOrganizerDashboard(): OrganizerDashboardData {
  return {
    ...BASE_MOCK,
    stats: { ...BASE_MOCK.stats },
    applications: BASE_MOCK.applications.filter((a) => !dismissedApplicationIds.has(a.id)),
    activeEvents: BASE_MOCK.activeEvents.map((ev) =>
      ev.kind === "upcoming"
        ? { ...ev, participantAvatarUrls: [...ev.participantAvatarUrls] }
        : { ...ev },
    ),
    allEvents: BASE_MOCK.allEvents.map((e) => ({ ...e })),
  };
}

export function mockDismissApplication(applicationId: string): void {
  dismissedApplicationIds.add(applicationId);
}
