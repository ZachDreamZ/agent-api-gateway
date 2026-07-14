import { getConfig } from './config.js';

// ─── Interface (Redis-swappable) ───

export interface Cache {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds: number): Promise<void>;
  del(key: string): Promise<void>;
}

// ─── In-Memory Fallback ───

interface Entry {
  value: string;
  expiresAt: number;
}

class InMemoryCache implements Cache {
  private store = new Map<string, Entry>();

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }
}

// ─── Singleton ───

let instance: Cache | null = null;

export function getCache(): Cache {
  if (instance) return instance;

  const cfg = getConfig();
  if (cfg.redisUrl) {
    // Lazy-load ioredis only when Redis is configured
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Redis = require('ioredis');
    const redis = new Redis(cfg.redisUrl);

    instance = {
      async get(key: string) {
        const val = await redis.get(key);
        return val ?? null;
      },
      async set(key: string, value: string, ttlSeconds: number) {
        await redis.setex(key, ttlSeconds, value);
      },
      async del(key: string) {
        await redis.del(key);
      },
    };
  } else {
    instance = new InMemoryCache();
  }

  return instance;
}
