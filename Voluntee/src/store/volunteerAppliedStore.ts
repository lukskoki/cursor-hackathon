import { create } from "zustand";

type VolunteerAppliedState = {
  appliedIds: Record<string, true>;
  markApplied: (eventId: string) => void;
};

export const useVolunteerAppliedStore = create<VolunteerAppliedState>((set) => ({
  appliedIds: {},
  markApplied: (eventId) =>
    set((s) => {
      if (s.appliedIds[eventId]) return s;
      return { appliedIds: { ...s.appliedIds, [eventId]: true } };
    }),
}));
