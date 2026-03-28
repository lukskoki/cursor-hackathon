export type UserRole = "volunteer" | "organization";

export type VolunteerProfile = {
  id: string;
  email: string;
  role: "volunteer";
  displayName: string;
};

export type OrganizationProfile = {
  id: string;
  email: string;
  role: "organization";
  organizationName: string;
  oib: string;
  contactPersonName?: string;
  city?: string;
  description?: string;
};

export type UserProfile = VolunteerProfile | OrganizationProfile;

export type User = Pick<UserProfile, "id" | "email" | "role">;
