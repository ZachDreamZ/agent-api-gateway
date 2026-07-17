"""
Resend API key setup via Chrome DevTools Protocol.
Expects normal Chrome started with:
  chrome.exe --remote-debugging-port=9223 --remote-allow-origins=*
             --user-data-dir="%LOCALAPPDATA%\\Google\\Chrome\\User Data"
             --profile-directory=Default
"""
from __future__ import annotations

import json
import re
import time
import urllib.request
from pathlib import Path

import websocket

ROOT = Path(__file__).resolve().parents[1]
ENV = ROOT / ".env"
CDP = "http://127.0.0.1:9223"


def http_json(url: str, method: str = "GET"):
    req = urllib.request.Request(url, method=method)
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.loads(r.read().decode())


def upsert(k: str, v: str) -> None:
    text = ENV.read_text(encoding="utf-8") if ENV.exists() else ""
    lines = text.splitlines()
    out, found = [], False
    for line in lines:
        if re.match(rf"^\s*{re.escape(k)}\s*=", line):
            out.append(f"{k}={v}")
            found = True
        else:
            out.append(line)
    if not found:
        if out and out[-1].strip():
            out.append("")
        out.append(f"{k}={v}")
    ENV.write_text("\n".join(out) + "\n", encoding="utf-8")


class CdpSession:
    def __init__(self, ws_url: str):
        self.ws = websocket.create_connection(ws_url, timeout=25)
        self.id = 0

    def call(self, method: str, params: dict | None = None, timeout: float = 25) -> dict:
        self.id += 1
        msg: dict = {"id": self.id, "method": method}
        if params:
            msg["params"] = params
        self.ws.send(json.dumps(msg))
        end = time.time() + timeout
        while time.time() < end:
            data = json.loads(self.ws.recv())
            if data.get("id") == self.id:
                if "error" in data:
                    raise RuntimeError(data["error"])
                return data.get("result") or {}
        raise TimeoutError(method)

    def eval(self, expression: str):
        r = self.call(
            "Runtime.evaluate",
            {
                "expression": expression,
                "returnByValue": True,
                "awaitPromise": True,
            },
        )
        if r.get("exceptionDetails"):
            raise RuntimeError(str(r["exceptionDetails"])[:400])
        return (r.get("result") or {}).get("value")

    def nav(self, url: str, wait: float = 2.5) -> str:
        self.call("Page.navigate", {"url": url})
        time.sleep(wait)
        return str(self.eval("location.href") or "")

    def close(self) -> None:
        try:
            self.ws.close()
        except Exception:
            pass


def pick_page() -> dict:
    pages = http_json(f"{CDP}/json/list")
    for p in pages:
        if p.get("type") == "page" and "resend.com" in (p.get("url") or ""):
            return p
    created = http_json(f"{CDP}/json/new?https://resend.com/api-keys", method="PUT")
    time.sleep(2)
    pages = http_json(f"{CDP}/json/list")
    for p in pages:
        if p.get("id") == created.get("id"):
            return p
        if p.get("type") == "page" and "resend.com" in (p.get("url") or ""):
            return p
    # fallback first page
    for p in pages:
        if p.get("type") == "page" and p.get("webSocketDebuggerUrl"):
            return p
    raise RuntimeError("No CDP page targets")


def click_text(cdp: CdpSession, pattern: str) -> str | None:
    return cdp.eval(
        f"""
        (() => {{
          const re = /{pattern}/i;
          const els = [...document.querySelectorAll('button,a,input,[role=button],div[role=link]')];
          const el = els.find(e => re.test((e.textContent||e.value||'').trim())
            || re.test(e.getAttribute('aria-label')||'')
            || re.test(e.getAttribute('href')||''));
          if (!el) return null;
          el.click();
          return (el.textContent||el.value||el.getAttribute('href')||'').trim().slice(0,100);
        }})()
        """
    )


def main() -> int:
    target = pick_page()
    print("target", target.get("title"), target.get("url"))
    cdp = CdpSession(target["webSocketDebuggerUrl"])
    try:
        cdp.call("Page.enable")
        cdp.call("Runtime.enable")
        url = cdp.nav("https://resend.com/api-keys", 3)
        print("url", url)

        # Login path
        if "login" in url or "signup" in url:
            # Prefer Google (Chrome account chooser) then GitHub
            for label in ("Log in with Google", "Log in with GitHub", "Google", "GitHub"):
                hit = click_text(cdp, re.escape(label))
                if hit:
                    print("login click", hit)
                    break
            time.sleep(4)
            url = str(cdp.eval("location.href") or "")
            print("after oauth start", url)

            # Google account chooser / identifier
            if "accounts.google.com" in url:
                # Prefer known account chip
                acc = cdp.eval(
                    """
                    (() => {
                      const items = [...document.querySelectorAll('[data-email], [data-identifier], li, div[role=link], div[role=button]')];
                      const pref = items.find(e => /xxtheshadowcraft@gmail\\.com/i.test(e.textContent||e.getAttribute('data-email')||e.getAttribute('data-identifier')||''));
                      const el = pref || items.find(e => /@gmail\\.com/i.test(e.textContent||''));
                      if (!el) return null;
                      el.click();
                      return (el.textContent||'').trim().slice(0,80);
                    })()
                    """
                )
                print("google account", acc)
                if not acc:
                    # Type email into identifier field
                    filled = cdp.eval(
                        """
                        (() => {
                          const email = 'xxtheshadowcraft@gmail.com';
                          const inp = document.querySelector('input[type=email], input[name=identifier], #identifierId');
                          if (!inp) return false;
                          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
                          setter.call(inp, email);
                          inp.dispatchEvent(new Event('input', { bubbles: true }));
                          return true;
                        })()
                        """
                    )
                    print("google email filled", filled)
                    click_text(cdp, "Next|Continue")
                time.sleep(3)
                print(
                    "WAITING: finish Google password/2FA in the Chrome window if prompted "
                    "(up to 2 minutes)..."
                )
                for i in range(60):
                    url = str(cdp.eval("location.href") or "")
                    if "resend.com" in url and "login" not in url and "accounts.google" not in url:
                        print("oauth landed", url)
                        break
                    if "resend.com/api-keys" in url or "resend.com/emails" in url:
                        print("oauth landed keys", url)
                        break
                    # consent screens
                    click_text(cdp, "Continue|Next|Allow|Confirm|I understand")
                    time.sleep(2)
                    if i % 10 == 9:
                        print(f"  still waiting... {url[:80]}")

            # GitHub authorize / login
            if "github.com" in str(cdp.eval("location.href") or ""):
                # already signed in -> Authorize app
                auth = click_text(cdp, "Authorize|Continue")
                print("github auth btn", auth)
                time.sleep(4)
                # if login form present, cannot fill password safely without user
                body = str(cdp.eval("document.body.innerText") or "")
                if re.search(r"Username or email", body, re.I):
                    print("GITHUB_NEEDS_LOGIN: sign in to GitHub in the Chrome window, then re-run this script")
                    return 3

            # back to api keys
            url = cdp.nav("https://resend.com/api-keys", 3)
            print("url after auth", url)

        if "login" in str(url):
            print("STILL_LOGIN")
            print((cdp.eval("document.body.innerText") or "")[:400].replace("\n", " | "))
            print("ACTION: In the Chrome window on port 9223, finish Resend login (Google/GitHub), leave api-keys open, re-run:")
            print("  python -u scripts/setup_resend_ws.py")
            return 2

        # Create API key
        clicked = click_text(cdp, "Create API key")
        print("create", clicked)
        time.sleep(1.2)

        cdp.eval(
            """
            (() => {
              const inputs = [...document.querySelectorAll('input[type=text], input:not([type]), input[name=name]')];
              const inp = inputs.find(i => i.offsetParent !== null) || inputs[0];
              if (!inp) return false;
              const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
              setter.call(inp, 'Agent API Gateway');
              inp.dispatchEvent(new Event('input', { bubbles: true }));
              inp.dispatchEvent(new Event('change', { bubbles: true }));
              return true;
            })()
            """
        )
        click_text(cdp, "Full access")
        submitted = click_text(cdp, "^(Add|Create|Save)$")
        # looser create
        if not submitted:
            submitted = click_text(cdp, "Add|Create")
        print("submit", submitted)
        time.sleep(2.5)

        keys = cdp.eval(
            """
            (() => {
              const text = document.body.innerText || '';
              const fromText = text.match(/re_[A-Za-z0-9]{20,}/g) || [];
              const fromInputs = [...document.querySelectorAll('input')]
                .map(i => i.value).filter(v => v && /^re_[A-Za-z0-9]{20,}$/.test(v));
              return [...new Set([...fromText, ...fromInputs])];
            })()
            """
        ) or []
        print("keys", [k[:8] + "..." for k in keys])

        if not keys:
            click_text(cdp, "Copy")
            time.sleep(0.4)
            keys = cdp.eval(
                "(() => (document.body.innerText||'').match(/re_[A-Za-z0-9]{20,}/g) || [])()"
            ) or []

        if not keys:
            print("FAIL no key visible")
            return 1

        secret = keys[0]
        upsert("RESEND_API_KEY", secret)
        upsert("EMAIL_FROM", "Agent API <onboarding@resend.dev>")
        upsert("BETTER_AUTH_URL", "https://agentapigw.dpdns.org")
        upsert("APP_DOMAIN", "https://agentapigw.dpdns.org")
        upsert(
            "CORS_ORIGIN",
            "http://localhost:3000,http://localhost:5173,https://agent-api-gateway.onrender.com,https://agentapigw.dpdns.org",
        )
        print("SUCCESS len", len(secret))
        return 0
    finally:
        cdp.close()


if __name__ == "__main__":
    raise SystemExit(main())
