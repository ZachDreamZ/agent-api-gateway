import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');

describe('conversion path structure', () => {
  it('free pricing CTA routes to /login not /dashboard', () => {
    const src = readFileSync(resolve(root, 'src/dashboard/src/pages/AuraLanding.tsx'), 'utf8');
    // Free plan block must prefer auth before dashboard
    assert.match(src, /tier:\s*'Free'[\s\S]*?href:\s*'\/login'/);
    assert.doesNotMatch(src, /tier:\s*'Free'[\s\S]*?href:\s*'\/dashboard'/);
  });

  it('overview ships real onboarding curl + API keys link', () => {
    const src = readFileSync(resolve(root, 'src/dashboard/src/pages/Overview.tsx'), 'utf8');
    assert.match(src, /OnboardingCard/);
    assert.match(src, /Create API key/);
    assert.match(src, /\/v1\/extract/);
    assert.match(src, /\/dashboard\/api-keys/);
    // no fabricated activity feed
    assert.doesNotMatch(src, /Extraction completed/);
    assert.doesNotMatch(src, /2 min ago/);
  });

  it('landing pricing surfaces all credit packs and subscriptions', () => {
    const src = readFileSync(resolve(root, 'src/dashboard/src/pages/AuraLanding.tsx'), 'utf8');
    assert.match(src, /id:\s*'credits_1k'[\s\S]*?href:\s*'\/buy\?sku=credits_1k'/);
    assert.match(src, /id:\s*'credits_5k'/);
    assert.match(src, /id:\s*'credits_25k'/);
    assert.match(src, /Credit packs/);
    assert.match(src, /Subscriptions/);
    assert.match(src, /Buy 1,000 credits for \$1/);
  });

  it('billing page surfaces credit packs alongside subscriptions', () => {
    const src = readFileSync(resolve(root, 'src/dashboard/src/pages/Billing.tsx'), 'utf8');
    assert.match(src, /FALLBACK_CREDIT_PACKS/);
    assert.match(src, /Credit packs/);
    assert.match(src, /handleBuyCredits/);
    assert.match(src, /Subscriptions/);
    assert.match(src, /id="credit-packs"/);
  });

  it('overview and docs expose credit pack UX', () => {
    const overview = readFileSync(resolve(root, 'src/dashboard/src/pages/Overview.tsx'), 'utf8');
    const docs = readFileSync(resolve(root, 'src/dashboard/src/pages/Docs.tsx'), 'utf8');
    assert.match(overview, /CreditPacksMini/);
    assert.match(overview, /credits_5k/);
    assert.match(docs, /credit_packs/);
    assert.match(docs, /credits_25k/);
  });
});