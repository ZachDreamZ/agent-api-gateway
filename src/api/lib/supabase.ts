import { createClient } from '@supabase/supabase-js';
import { getConfig } from './config.js';

let client: any = null;

export function getSupabase(): any {
  if (!client) {
    const cfg = getConfig();
    client = createClient(cfg.supabaseUrl, cfg.supabaseServiceRoleKey, {
      auth: { persistSession: false },
    });
  }
  return client;
}
