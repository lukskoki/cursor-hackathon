export const authService = {
  signIn: async (_email: string, _password: string) => ({ token: "" }),
  signOut: async () => {},
  register: async (_input: unknown) => ({ token: "" }),
};
