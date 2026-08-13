// simple in-memory stand-in for ioredis during tests
const store = new Map<string, string>();

export const redisClient = {
  get: async (key: string) => store.get(key) || null,
  set: async (key: string, value: string) => {
    store.set(key, value);
    return 'OK';
  },
  del: async (...keys: string[]) => {
    keys.forEach((k) => store.delete(k));
    return keys.length;
  },
  keys: async (pattern: string) => {
    const prefix = pattern.replace('*', '');
    return Array.from(store.keys()).filter((k) => k.startsWith(prefix));
  },
  call: async () => 'OK',
  on: () => undefined,
};