import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { assertSafePublicUrl } from '../src/api/lib/ssrf.ts';

describe('assertSafePublicUrl', () => {
  it('allows public https URLs', () => {
    const r = assertSafePublicUrl('https://example.com/product/1');
    assert.equal(r.ok, true);
  });

  it('blocks localhost', () => {
    assert.equal(assertSafePublicUrl('http://localhost/admin').ok, false);
    assert.equal(assertSafePublicUrl('http://127.0.0.1/').ok, false);
  });

  it('blocks private IPv4 ranges', () => {
    assert.equal(assertSafePublicUrl('http://10.0.0.5/').ok, false);
    assert.equal(assertSafePublicUrl('http://192.168.1.1/').ok, false);
    assert.equal(assertSafePublicUrl('http://172.16.0.1/').ok, false);
  });

  it('blocks cloud metadata host', () => {
    assert.equal(assertSafePublicUrl('http://metadata.google.internal/').ok, false);
    assert.equal(assertSafePublicUrl('http://169.254.169.254/latest/meta-data').ok, false);
  });

  it('blocks credentials in URL', () => {
    assert.equal(assertSafePublicUrl('https://user:pass@example.com/').ok, false);
  });

  it('blocks non-http schemes', () => {
    assert.equal(assertSafePublicUrl('file:///etc/passwd').ok, false);
    assert.equal(assertSafePublicUrl('ftp://example.com/').ok, false);
  });
});
