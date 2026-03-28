import { apiGet } from "./apiClient";

export const userService = {
  getMe: () => apiGet<unknown>("/me"),
};
