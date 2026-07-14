import { createHash } from 'node:crypto';
import type { MiddlewareHandler } from 'hono';
import type { DbUser, DbApiKey, Tier } from '../../shared/types.js';
import { getSupabase } from '../lib/supabase.js';
import { getConfig } from '../lib/config.js';

// Extend Hono context variables
declare module 'hono' {
  interface ContextVariableMap {
    user: DbUser;
    apiKey: DbApiKey;
    tier: Tier;
  }
}

function hashKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Missing or invalid Authorization header. Use: Bearer sk-xxx' }, 401);
  }

  const rawKey = authHeader.slice(7).trim();
  const prefix = getConfig().apiKeyPrefix;
  if (!rawKey.startsWith(prefix)) {
    return c.json({ error: `Invalid API key format. Key must start with "${prefix}"` }, 401);
  }

  const keyHash = hashKey(rawKey);
  const supabase = getSupabase();

  const { data: apiKey, error } = await supabase
    .from('api_keys')
    .select('*, user:user_id(*)')
    .eq('key_hash', keyHash)
    .single<DbApiKey & { user: DbUser }>();

  if (error || !apiKey) {
    return c.json({ error: 'Invalid API key' }, 401);
  }

  if (!apiKey.active) {
    return c.json({ error: 'API key is deactivated' }, 401);
  }

  // Stamp context
  c.set('user', apiKey.user);
  c.set('apiKey', {
    id: apiKey.id,
    user_id: apiKey.user_id,
    key_hash: apiKey.key_hash,
    name: apiKey.name,
    active: apiKey.active,
    last_used_at: apiKey.last_used_at,
    created_at: apiKey.created_at,
  });
  c.set('tier', apiKey.user.tier as Tier);

  // Update last_used_at asynchronously (fire-and-forget)
  supabase
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', apiKey.id)
    .then(() => {}, () => {});

  await next();
};
