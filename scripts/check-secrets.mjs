#!/usr/bin/env node
/**
 * Fail CI/local if high-risk secret patterns appear in tracked files.
 * Does not read .env (gitignored). Run: node scripts/check-secrets.mjs
 */
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const patterns = [
  { name: 'Google API key', re: /AIza[0-9A-Za-z_-]{20,}/ },
  { name: 'GitHub PAT', re: /ghp_[A-Za-z0-9]{20,}/ },
  { name: 'Resend live key', re: /re_[A-Za-z0-9]{20,}/ },
  { name: 'Postgres URL with password', re: /postgres(?:ql)?:\/\/[^:\s]+:[^@\s]+@/i },
  { name: 'AWS access key', re: /AKIA[0-9A-Z]{16}/ },
  { name: 'Private key block', re: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
];

// Allowlist substrings for docs/examples
const allow = [
  'sk-your-api-key',
  'sk-...',
  'sk-<your-api-key>',
  'Bearer sk-...',
  'AIza...',
  'postgresql://postgres:<password>@',
  're_xxxxxxxx',
];

function listTracked() {
  const out = execSync('git ls-files', { encoding: 'utf8' });
  return out.split(/\r?\n/).filter(Boolean);
}

const skipExt = /\.(png|jpg|jpeg|gif|webp|ico|woff2?|lock)$/i;
const skipPath = /^(node_modules|dist|package-lock\.json)/;

let failed = 0;
for (const file of listTracked()) {
  if (skipExt.test(file) || skipPath.test(file)) continue;
  let text;
  try {
    text = readFileSync(file, 'utf8');
  } catch {
    continue;
  }
  // Skip binary-ish
  if (text.includes('\0')) continue;

  for (const { name, re } of patterns) {
    const m = text.match(re);
    if (!m) continue;
    const hit = m[0];
    if (allow.some((a) => hit.includes(a) || text.includes(a) && hit.length < 40)) {
      // still flag real-looking long secrets even near allow docs
      if (hit.length < 24 && allow.some((a) => a.includes(hit.slice(0, 8)))) continue;
    }
    // Extra allow: documentation placeholders only
    if (/example\.com|your-api-key|YOUR_|<.*>|\.\.\./i.test(hit)) continue;
    if (file.endsWith('.example') || file.includes('docs/')) {
      if (/password|AIza\.\.\.|sk-\.\.\./i.test(text.slice(Math.max(0, text.indexOf(hit) - 40), text.indexOf(hit) + 40))) {
        continue;
      }
    }
    console.error(`SECRET_PATTERN ${name} in ${file}: ${hit.slice(0, 12)}…`);
    failed++;
  }
}

if (failed > 0) {
  console.error(`\nFound ${failed} potential secret leak(s). Remove them from git history if real.`);
  process.exit(1);
}
console.log('check-secrets: no high-risk patterns in tracked files');
