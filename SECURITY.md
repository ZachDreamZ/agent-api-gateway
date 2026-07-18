# Security

Security posture and operational runbooks for the NexusCore SaaS suite
(`agent-api-gateway` + `status-plate`). Aligned to OpenVPN's SaaS Security
Checklist.

## Checklist alignment

| # | Control | Status | Notes |
|---|---------|--------|-------|
| 1 | Multi-factor authentication | ✅ Implemented (opt-in) | TOTP 2FA via `better-auth/2fa`. Users enable voluntarily from the dashboard; not enforced at sign-in (per product decision). |
| 2 | Threat monitoring | ✅ Implemented | `src/api/lib/alert.ts` emits security alerts on failed auth bursts; forwards to `ALERT_WEBHOOK_URL` when set. Render logs retained. |
| 3 | Regular access reviews | ✅ Tooling + process | `scripts/access-review.ts` lists users, 2FA status, and inactive accounts. Run quarterly. |
| 4 | Network segmentation | 🟡 Partial | Single shared Render Postgres (`agentapi_kjz2`) used by both apps. Least-privilege per-app DB roles are the recommended next step (see below). |
| 5 | Incident response plan | ✅ Documented | See "Incident response" below. |
| 6 | Data encryption | ✅ Met | TLS in transit (HTTPS + Secure cookies). At rest: Render Postgres encryption-at-rest (platform default). |
| 7 | Logging & audit trails | ✅ Implemented | Structured JSON audit logs (session create/revoke, user update, account link) in both apps via Better Auth `databaseHooks`. |

## Data encryption

- **In transit:** All public traffic is HTTPS (Cloudflare → Render). `useSecureCookies`
  and `secure` cookie flags are enabled when the origin is HTTPS. App → Postgres
  connections enforce TLS (`require: true` via the shared `pg` pool in `src/api/lib/db.ts`);
  chain validation is relaxed because Render does not publish a CA bundle to pin
  — acceptable over Render's private network between co-located services.
- **At rest:** Render Postgres encrypts data at rest by default. The database
  password is stored only in Render's encrypted env, never in source control.
- **Future:** move secrets to a dedicated vault (e.g. Render secret files / Doppler)
  — tracked, not yet implemented.

## Threat monitoring

`alertAuthFailure()` / `alertSecurityEvent()` (`src/api/lib/alert.ts`) log security
events and, when `ALERT_WEBHOOK_URL` is set, post to a Slack/Discord incoming
webhook. Detection is local + burst-based (≥10 failed auth events / 10 min per
identity). To enable: set `ALERT_WEBHOOK_URL` in the service env.

## Regular access reviews

```bash
# On Render (internal DB host only) or any host with DB network access:
DATABASE_URL=... npm run access:review -- --inactive-days=90
```

Review the flagged inactive accounts and disable/delete as appropriate. Re-run
quarterly. Document the review date and action taken.

## Network segmentation (least-privilege DB roles)

Both apps share one Render Postgres instance (`agentapi_kjz2`). The `scripts/db-least-privilege.sql`
file creates per-app roles (`agentapi_app`, `statusplate_app`) with their own credentials and
grants them the same working privileges the apps need, **without** altering or dropping the shared
owner role (`agentapi_user`). This gives credential separation + independent revocation/rotation.

**Run it** (inside Render's network — use the web service **Shell** tab at
`dashboard.render.com/web/srv-d9av07e7r5hc739guseg/shell`, which can reach the internal DB host;
no external IP exposure needed):

```bash
# substitute strong passwords for CHANGE_ME_agentapi / CHANGE_ME_statusplate
sed -e 's/CHANGE_ME_agentapi/<strong-pw-1>/' -e 's/CHANGE_ME_statusplate/<strong-pw-2>/' \
  scripts/db-least-privilege.sql > /tmp/lp.sql
psql "$DATABASE_URL" -f /tmp/lp.sql
```

Then update each service's `DATABASE_URL` in its Render env to the new role's connection string
and redeploy. The old `agentapi_user` role is retained as owner for rollback.

**Rollback:** `DROP ROLE agentapi_app; DROP ROLE statusplate_app;` (apps keep working on `agentapi_user`).

> Note: because both apps share the Better Auth tables, this provides *credential* isolation
> (revocable per-app DB passwords), not schema-level table isolation. Full table isolation would
> require moving status-plate to a separate database/schema — a larger migration, deferred.

## Incident response

### Contacts
- Owner: ZachDreamZ — `xxtheshadowcraft@gmail.com`
- Support inbox: `support@agentapigw.dpdns.org`

### Breach containment (ordered)
1. **Identify scope** — check Render logs + DB audit logs (`session`, `account`,
   `usage_logs`) for the affected window.
2. **Contain** — rotate the compromised credentials (below) and, if needed,
   temporarily disable the service from the Render dashboard.
3. **Eradicate** — remove malicious sessions (`DELETE FROM session WHERE ...`),
   revoke leaked API keys, force-reissue user passwords if account takeover.
4. **Notify** — email affected users via Resend; if PII exposure, follow
   applicable breach-notification rules.
5. **Post-mortem** — record timeline, root cause, and preventive action.

### Secret rotation runbook

Rotate each secret, then update the corresponding Render env var and redeploy.

| Secret | Where | Rotation |
|--------|-------|----------|
| `BETTER_AUTH_SECRET` | both apps (Render env) | Generate new 32-byte hex; update env; redeploy. Invalidates all sessions. |
| `RESEND_API_KEY` | both apps | Rotate in Resend dashboard; update env; redeploy. |
| `POLAR_ACCESS_TOKEN` / `POLAR_WEBHOOK_SECRET` | both apps | Rotate in Polar dashboard; update env; redeploy. |
| `GITHUB_CLIENT_SECRET` / `GOOGLE_CLIENT_SECRET` | both apps | Rotate in provider console; update env; redeploy. |
| `DATABASE_URL` (DB password) | both apps | Reset in Render Postgres → update connection string in env; redeploy. |
| `SUPABASE_SERVICE_ROLE_KEY` | — | N/A — Supabase project deleted (was unused). |

### Lockdown procedure
- Disable the web service in Render (pause) to stop all traffic.
- Rotate `BETTER_AUTH_SECRET` and `DATABASE_URL` password immediately.
- Redeploy with rotated secrets before re-enabling.

## Audit logging

Both apps emit structured JSON to stdout:
- `session.created` / `session.revoked`
- `user.updated`
- `account.linked` (OAuth provider linkage)
- `auth.verification_email_queued`, `auth.password_reset_requested`
- security alerts: `alert:auth_failure`, `alert:auth_failure_burst`, `alert:suspicious_usage`

These flow into Render's log stream for compliance and forensic use.
