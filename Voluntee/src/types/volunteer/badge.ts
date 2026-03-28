export type BadgeId =
  | "first_event"
  | "community_helper"
  | "city_hero"
  | "eco_warrior"
  | "animal_friend";

export type Badge = {
  id: BadgeId;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  category?: string;
  unlocked: boolean;
  progress: number;
};
