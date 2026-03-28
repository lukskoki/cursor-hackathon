export type AuthTokens = {
  accessToken: string;
  refreshToken?: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};
