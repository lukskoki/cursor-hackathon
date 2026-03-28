export function useAuth() {
  return { user: null as unknown, signIn: async () => {}, signOut: async () => {} };
}
