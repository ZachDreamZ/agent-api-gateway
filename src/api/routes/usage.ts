import { Hono } from 'hono';
import { TIER_LIMITS } from '../../shared/types.js';
import { getSupabase } from '../lib/supabase.js';

// ─── Routes ───

const router = new Hono();

router.get('/', async (c) => {
  const user = c.get('user');
  const tier = c.get('tier');

  try {
    const supabase = getSupabase();

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('usage_logs')
      .select('credits_used')
      .gte('created_at', monthStart.toISOString())
      .eq('user_id', user.id);

    if (error) {
      console.error('[usage] query failed:', error);
      return c.json({ error: 'Failed to fetch usage data' }, 500);
    }

    const creditsUsed = (data ?? []).reduce(
      (sum, row) => sum + (row.credits_used ?? 0),
      0,
    );
    const monthlyLimit = TIER_LIMITS[tier].queries_per_month;

    return c.json({
      tier,
      credits_used: creditsUsed,
      credits_limit: monthlyLimit,
      credits_remaining: Math.max(0, monthlyLimit - creditsUsed),
      period_start: monthStart.toISOString(),
    });
  } catch (err) {
    console.error('[usage] unexpected error:', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export { router as usageRoutes };
