/**
 * Product-core tests — exercise the shipped business logic (validator + pricing).
 * No re-implementation: imports real modules from src/.
 */
import { describe, it, expect } from 'node:test';
import assert from 'node:assert/strict';
import { validateExtraction, ValidationError } from '../src/extraction/validator.ts';
import { TIER_PRICING, formatPrice, getPricingByTier, TIER_ORDER } from '../src/billing/pricing.ts';
import { getPolarProductId, getStarterProductId } from '../src/billing/polar.ts';

// ─── Core paid capability: structured extraction validation ───

describe('validateExtraction (shipped product core)', () => {
  it('returns non-empty product business fields from raw LLM-shaped JSON', () => {
    const raw = {
      name: '  Studio Headphones Pro  ',
      brand: 'AuraSound',
      price: '$249.99',
      currency: 'USD',
      in_stock: 'in stock',
      rating: '4.7',
      review_count: '1284',
      description: 'Wireless over-ear headphones with ANC.',
      image: 'https://cdn.example.com/hp.png',
      specs: { battery: '30h', weight: '250g' },
      availability: 'ships in 24h',
    };

    const data = validateExtraction('product', raw);

    assert.equal(data.name, 'Studio Headphones Pro');
    assert.equal(data.brand, 'AuraSound');
    assert.equal(data.price, 249.99);
    assert.equal(data.currency, 'USD');
    assert.equal(data.in_stock, true);
    assert.equal(data.rating, 4.7);
    assert.equal(data.review_count, 1284);
    assert.ok(typeof data.description === 'string' && (data.description as string).length > 0);
    assert.deepEqual(data.specs, { battery: '30h', weight: '250g' });
  });

  it('returns non-empty article fields', () => {
    const data = validateExtraction('article', {
      title: 'Why Agents Need Structured Web Data',
      author: 'NexusCore',
      date: '2026-07-17',
      reading_time: 6,
      excerpt: 'HTML is noisy. Agents want JSON.',
      content_summary: 'A short overview of extraction APIs for agents.',
      topics: ['agents', 'apis', 'extraction'],
    });

    assert.equal(data.title, 'Why Agents Need Structured Web Data');
    assert.equal(data.author, 'NexusCore');
    assert.ok(Array.isArray(data.topics) && (data.topics as string[]).length === 3);
    assert.ok(typeof data.content_summary === 'string' && (data.content_summary as string).length > 10);
  });

  it('returns non-empty company fields', () => {
    const data = validateExtraction('company', {
      name: 'AgentAPI Inc',
      description: 'Structured web data for AI agents',
      founded: '2026',
      size: '1-10',
      funding_total: '$0 bootstrap',
      industry: 'Developer Tools',
      location: 'Remote',
      competitors: ['Firecrawl', 'Browserbase'],
    });

    assert.equal(data.name, 'AgentAPI Inc');
    assert.ok((data.description as string).includes('AI agents'));
    assert.ok(Array.isArray(data.competitors) && (data.competitors as string[]).length >= 1);
  });

  it('rejects non-object product payloads', () => {
    assert.throws(() => validateExtraction('product', null), ValidationError);
    assert.throws(() => validateExtraction('product', 'not-json'), ValidationError);
  });
});

// ─── Monetization surface: pricing catalog ───

describe('pricing catalog (paid value proposition)', () => {
  it('exposes free + paid tiers with positive prices for hobby/pro', () => {
    assert.ok(TIER_ORDER.includes('free'));
    assert.ok(TIER_ORDER.includes('hobby'));
    assert.ok(TIER_ORDER.includes('pro'));

    const free = getPricingByTier('free');
    const hobby = getPricingByTier('hobby');
    const pro = getPricingByTier('pro');

    assert.equal(free.price_monthly, 0);
    assert.ok(hobby.price_monthly > 0, 'hobby must be a paid tier');
    assert.ok(pro.price_monthly > 0, 'pro must be a paid tier');
    assert.ok(hobby.queries_per_month > free.queries_per_month);
    assert.equal(formatPrice(hobby.price_monthly), '$29/mo');
    assert.equal(formatPrice(0), 'Free');
  });

  it('every tier has a non-empty feature list describing what buyers get', () => {
    for (const tier of TIER_ORDER) {
      const p = TIER_PRICING[tier];
      assert.ok(p.name.length > 0);
      assert.ok(p.features.length >= 3, `${tier} needs features`);
      assert.ok(p.features.some((f) => f.included), `${tier} needs included features`);
    }
  });
});

// ─── Polar product id resolution (env-driven entitlement wiring) ───

describe('polar product id helpers', () => {
  it('reads hobby/pro/scale and starter from env without throwing', () => {
    // Functions must be invokable; values may be null when unset (local CI without secrets).
    const hobby = getPolarProductId('hobby');
    const pro = getPolarProductId('pro');
    const scale = getPolarProductId('scale');
    const starter = getStarterProductId();
    const free = getPolarProductId('free');

    assert.equal(free, null);
    // Types: string | null
    for (const v of [hobby, pro, scale, starter]) {
      assert.ok(v === null || (typeof v === 'string' && v.length > 0));
    }
  });
});
