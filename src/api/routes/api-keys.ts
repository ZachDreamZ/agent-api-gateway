import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import crypto from 'node:crypto';
import { getSupabase } from '../lib/supabase.js';

// ─── Helpers ───

function hashKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

function generateKey(): { full: string; prefix: string; hash: string } {
  const raw = crypto.randomBytes(32).toString('hex');
  const full = `sk-${raw}`;
  return {
    full,
    prefix: full.slice(0, 10),
    hash: hashKey(full),
  };
}

// ─── Router ───

const apiKeysApp = new Hono();

// GET / — List all keys for user
apiKeysApp.get('/', async (c) => {
  const user = c.get('user');
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('api_keys')
    .select('id, name, active, last_used_at, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[api-keys] list error:', error);
    return c.json({ error: 'Failed to list keys' }, 500);
  }

  return c.json({ keys: data ?? [] });
});

// POST / — Create new key
const createSchema = z.object({
  name: z.string().min(1).max(64),
});

apiKeysApp.post('/', zValidator('json', createSchema), async (c) => {
  try {
    const { name } = c.req.valid('json');
    const user = c.get('user');
    const supabase = getSupabase();

    const { full, prefix, hash } = generateKey();

    const { data, error } = await supabase
      .from('api_keys')
      .insert({
        user_id: user.id,
        key_hash: hash,
        name,
        active: true,
      })
      .select('id, name, created_at')
      .single();

    if (error) {
      console.error('[api-keys] create error:', error);
      return c.json({ error: 'Failed to create key' }, 500);
    }

    return c.json({
      key: full,           // only shown once
      id: data.id,
      name: data.name,
      prefix,
      created_at: data.created_at,
    }, 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Key creation failed';
    return c.json({ error: message }, 500);
  }
});

// DELETE /:id — Revoke a key
apiKeysApp.delete('/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const supabase = getSupabase();

  const { error } = await supabase
    .from('api_keys')
    .update({ active: false })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return c.json({ error: 'Key not found' }, 404);
  }

  return c.json({ success: true, id });
});

// PATCH /:id/toggle — Enable/disable a key
apiKeysApp.patch('/:id/toggle', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const supabase = getSupabase();

  // Get current state
  const { data: current } = await supabase
    .from('api_keys')
    .select('active')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!current) {
    return c.json({ error: 'Key not found' }, 404);
  }

  const { error } = await supabase
    .from('api_keys')
    .update({ active: !current.active })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return c.json({ error: 'Toggle failed' }, 500);
  }

  return c.json({ success: true, id, active: !current.active });
});

export { apiKeysApp, hashKey };
