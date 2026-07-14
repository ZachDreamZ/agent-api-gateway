import { createClient } from '@supabase/supabase-js';
import { createHash } from 'node:crypto';

const supabase = createClient(
  'https://roaftjpifewtalcsrjmb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvYWZ0anBpZmV3dGFsY3Nyam1iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzA1MDE0MSwiZXhwIjoyMDk4NjI2MTQxfQ.vCU1_ewwPJyt-yfTbFi2DilSt6pKf5JfPyaIJdabB54'
);

const keyHash = createHash('sha256').update('sk-test-123').digest('hex');

async function main() {
  // Insert user
  const { data: user, error: userErr } = await supabase
    .from('users')
    .upsert({ id: '00000000-0000-0000-0000-000000000001', email: 'test@example.com', tier: 'pro' })
    .select()
    .single();
  
  if (userErr) { console.error('User error:', userErr); return; }
  console.log('User:', user.email, user.tier);

  // Insert API key
  const { data: key, error: keyErr } = await supabase
    .from('api_keys')
    .upsert({ user_id: user.id, key_hash: keyHash, name: 'Test Key' })
    .select()
    .single();

  if (keyErr) { console.error('Key error:', keyErr); return; }
  console.log('API Key created: sk-test-123 (hash:', keyHash.slice(0, 12) + '...)');
  console.log('Test extraction: curl https://agent-api-gateway.onrender.com/v1/extract -H "Authorization: Bearer sk-test-123" -H "Content-Type: application/json" -d \'{"url":"https://example.com","schema":"article"}\'');
}

main();
