# Control logged-in Brave (and cua-driver)

## Brave + Playwright CDP

Restart Brave with remote debugging (keeps your profile/logins):

```powershell
python scripts/brave_cdp.py start
```

Then:

```powershell
python scripts/brave_cdp.py status
python scripts/brave_cdp.py tabs
python scripts/brave_cdp.py open https://polar.sh/dashboard
python scripts/brave_cdp.py polar-email
python scripts/brave_cdp.py cf-email
```

Env overrides: `BRAVE_EXE`, `BRAVE_USER_DATA`, `BRAVE_PROFILE`, `BRAVE_CDP_PORT` (default `9222`).

## cua-driver (installed)

Daemon:

```powershell
$env:CUA_DRIVER_CDP_PORT = "9222"
cua-driver serve   # if not already running
cua-driver status
cua-driver list-tools
```

Call tools (PowerShell 5 needs JSON via stdin):

```powershell
'{"action":"get_text","pid":20260,"window_id":721852,"cdp_port":9222}' | cua-driver call page
```

Useful tools: `list_apps`, `list_windows`, `get_window_state`, `page` (JS/DOM on Brave with CDP), `click`, `set_value`.

## Support email stack

| Item | Value |
|------|--------|
| Business email | `support@agentapigw.dpdns.org` |
| Website | `https://agentapigw.dpdns.org` |
| Forwarding | ImprovMX → `xxtheshadowcraft@gmail.com` |
| DNS | Cloudflare MX `mx1/mx2.improvmx.com` + SPF TXT |
