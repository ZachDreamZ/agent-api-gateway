import { Hono } from 'hono';
import { TIER_LIMITS } from '../../shared/types.js';
import { getMonthlyCreditsUsed, getDailyUsage } from '../lib/usage-db.js';

const router = new Hono();

router.get('/', async (c) => {
  const user = c.get('user');
  const tier = c.get('tier');

  try {
    const creditsUsed = await getMonthlyCreditsUsed(user.id);
    const monthlyLimit = TIER_LIMITS[tier].queries_per_month;

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

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
