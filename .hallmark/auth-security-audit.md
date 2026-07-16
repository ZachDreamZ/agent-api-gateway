# Auth Security Audit — Agent API Gateway

**Date:** 2026-07-16
**Target:** `src/auth/auth.ts`
**Checklist source:** Better Auth security best-practices

---

## Audit Results

| # | Check | Status | Finding |
|---|-------|--------|---------|
| 1 | **Secret strength** | ✅ PASS | `BETTER_AUTH_SECRET` env var (not hardcoded). Length/entropy enforced by Better Auth at startup. |
| 2 | **HTTPS baseURL** | ⚠️ WARN | `baseURL` sourced from `BETTER_AUTH_URL` env var — correct pattern, but production relies on correct env config. Trusted origins correctly list both HTTP (localhost dev) and HTTPS (production) variants. |
| 3 | **Trusted origins** | ✅ PASS | 4 origins: `localhost:3000`, `localhost:5173`, `agent-api-gateway.onrender.com`, `agentapigw.dpdns.org`. Covers all known clients. |
| 4 | **Rate limiting** | ❌ FAIL | Missing entirely. No `rateLimit` block. This is the highest-priority gap — no protection against brute-force auth attacks. |
| 5 | **CSRF protection** | ⚠️ WARN | Not explicitly configured. Better Auth default is `disableCSRFCheck: false` (protected), but should be explicit for clarity. |
| 6 | **Secure cookies** | ⚠️ WARN | `useSecureCookies` not set. Better Auth auto-detects HTTPS, but explicit `true` in production is better. |
| 7 | **OAuth token encryption** | ✅ N/A | No social/OAuth providers configured. |
| 8 | **Session expiry** | ✅ PASS | `expiresIn: 7 days`, `updateAge: 24 hours` — reasonable defaults. No `freshAge` for sensitive actions. |
| 9 | **Cookie cache** | ❌ FAIL | Not configured. Every request re-fetches session from DB. Adding a JWE cookie cache would reduce latency and DB load. |
| 10 | **Cookie scope/prefix** | ⚠️ WARN | Default `better-auth` prefix, default `sameSite: "lax"`. Fine for current single-origin deployment, but `sameSite: "strict"` would be safer. |
| 11 | **Cross-subdomain cookies** | ✅ N/A | Not configured — correct for single-domain deployment. |
| 12 | **IP tracking** | ❌ FAIL | No `ipAddress` config. Rate limiting (once added) will not have accurate client IP behind Render's proxy. Must configure `ipAddressHeaders: ["x-forwarded-for"]`. |
| 13 | **Background tasks** | ❌ FAIL | Not configured. Operations like email sending will block response timing. Render (Node) doesn't need a special handler, but explicit config is recommended. |
| 14 | **Audit logging** | ❌ FAIL | No `databaseHooks` configured. Session creation/deletion, user updates, account linking not logged. |
| 15 | **Account enumeration prevention** | ✅ PASS | Built into Better Auth — consistent error messages. |

## Summary

### Passed (5)
Secret, Trusted origins, Session expiry, OAuth (N/A), Account enumeration, Cross-subdomain (N/A)

### Warnings (4)
HTTPS baseURL, CSRF (implicit), Secure cookies, Cookie scope

### Failed — to be fixed (5)
- **Rate limiting** → Step 2
- **Cookie cache** → Step 3
- **Audit logging** → Step 4
- **IP tracking** → Fix alongside rate limiting (Step 2)
- **Background tasks** → Fix alongside audit logging (Step 4)

## Remediation Plan

| Step | What | File(s) |
|------|------|---------|
| 2 | Add rate limiting (database storage, custom rules) + IP tracking headers | `src/auth/auth.ts` |
| 3 | Add session cookie cache (JWE, 5min) | `src/auth/auth.ts` |
| 4 | Add audit logging via databaseHooks + background tasks handler | `src/auth/auth.ts` |
