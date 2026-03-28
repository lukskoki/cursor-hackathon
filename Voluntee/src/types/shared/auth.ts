export type RegisterVolunteerInput = {
  email: string;
  password: string;
  displayName: string;
};

export type RegisterOrganizationInput = {
  email: string;
  password: string;
  organizationName: string;
  oib: string;
  contactPersonName?: string;
};
