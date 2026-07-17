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

  it('paid path still points at /buy for starter', () => {
    const src = readFileSync(resolve(root, 'src/dashboard/src/pages/AuraLanding.tsx'), 'utf8');
    assert.match(src, /tier:\s*'Starter Pack'[\s\S]*?href:\s*'\/buy'/);
  });
});
