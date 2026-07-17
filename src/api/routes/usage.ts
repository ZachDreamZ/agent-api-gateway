import { Hono } from 'hono';
import { TIER_LIMITS } from '../../shared/types.js';
import { getCreditBalance, getDailyUsage } from '../lib/usage-db.js';

const router = new Hono();

router.get('/', async (c) => {
  const user = c.get('user');
  const tier = c.get('tier');

  try {
    const monthlyLimit = TIER_LIMITS[tier].queries_per_month;
    const balance = await getCreditBalance(user.id, monthlyLimit);

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    return c.json({
      tier,
      credits_used: balance.used,
      credits_limit: balance.limit,
      monthly_limit: monthlyLimit,
      bonus_credits: balance.bonus,
      credits_remaining: balance.remaining,
      period_start: monthStart.toISOString(),
    });
  } catch (err) {
    console.error('[usage] unexpected error:', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

router.get('/daily', async (c) => {
  const user = c.get('user');

  try {
    const days = await getDailyUsage(user.id, 7);
    return c.json({ days });
  } catch (err) {
    console.error('[usage/daily] unexpected error:', err);
    return c.json({ days: [] });
  }
});

export { router as usageRoutes };
