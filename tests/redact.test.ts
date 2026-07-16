import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { redactSecrets, safeErrorMessage } from '../src/auth/redact.ts';

describe('redactSecrets', () => {
  it('redacts sk- style keys', () => {
    const out = redactSecrets('key=sk-abcdefghijklmnopqrstuvwxyz');
    assert.ok(!out.includes('sk-abcdefghijklmnopqrstuvwxyz'));
    assert.ok(out.includes('***'));
  });

  it('redacts postgres credentials', () => {
    const out = redactSecrets('postgresql://user:SuperSecret@db.example.com:5432/app');
    assert.ok(!out.includes('SuperSecret'));
    assert.ok(out.includes('***'));
  });

  it('redacts bearer tokens', () => {
    const out = redactSecrets('Authorization: Bearer abcdefghijklmnop');
    assert.ok(!out.toLowerCase().includes('abcdefghijklmnop'));
  });

  it('safeErrorMessage handles Error', () => {
    const msg = safeErrorMessage(new Error('fail sk-abcdefghijklmnop here'));
    assert.ok(!msg.includes('sk-abcdefghijklmnop'));
  });
});
