const memory = new Map<string, string>();

export const storageService = {
  get: async (key: string) => memory.get(key) ?? null,
  set: async (key: string, value: string) => {
    memory.set(key, value);
  },
  remove: async (key: string) => {
    memory.delete(key);
  },
};
