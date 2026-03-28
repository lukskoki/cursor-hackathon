export type UserRole = "volunteer" | "organization";

export type User = {
  id: string;
  email: string;
  role: UserRole;
};
