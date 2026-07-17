#!/usr/bin/env python3
"""
Control the user's logged-in Brave browser via Chrome DevTools Protocol (CDP).

Usage:
  python scripts/brave_cdp.py start          # restart Brave with --remote-debugging-port
  python scripts/brave_cdp.py status         # check CDP endpoint
  python scripts/brave_cdp.py tabs           # list open tabs
  python scripts/brave_cdp.py open <url>     # navigate (new tab)
  python scripts/brave_cdp.py eval <js>      # run JS in active tab
  python scripts/brave_cdp.py screenshot [path]
  python scripts/brave_cdp.py text           # body innerText snippet
  python scripts/brave_cdp.py click <css>
  python scripts/brave_cdp.py fill <css> <text>
  python scripts/brave_cdp.py wait <ms>
  python scripts/brave_cdp.py polar-email    # set Polar business email via dashboard if logged in
  python scripts/brave_cdp.py cf-email       # open Cloudflare email routing for agentapigw.dpdns.org
  python scripts/brave_cdp.py improvmx       # open ImprovMX after login

Brave must be started with remote debugging (see `start`) so Playwright can
reuse the real profile (cookies, logins).
"""
from __future__ import annotations

import json
import os
import subprocess
import sys
import time
from pathlib import Path
from typing import Any, Optional
from urllib.request import urlopen
from urllib.error import URLError

PORT = int(os.environ.get("BRAVE_CDP_PORT", "9222"))
CDP = f"http://127.0.0.1:{PORT}"
BRAVE_EXE = os.environ.get(
    "BRAVE_EXE",
    r"C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe",
)
USER_DATA = os.environ.get(
    "BRAVE_USER_DATA",
    str(Path(os.environ["LOCALAPPDATA"]) / "BraveSoftware" / "Brave-Browser" / "User Data"),
)
PROFILE = os.environ.get("BRAVE_PROFILE", "Default")
SUPPORT_EMAIL = "support@agentapigw.dpdns.org"
WEBSITE = "https://agentapigw.dpdns.org"


def cdp_ready(timeout: float = 2.0) -> bool:
    try:
        with urlopen(f"{CDP}/json/version", timeout=timeout) as r:
            return r.status == 200
    except Exception:
        return False


def cdp_version() -> dict[str, Any]:
    with urlopen(f"{CDP}/json/version", timeout=5) as r:
        return json.loads(r.read().decode())


def cdp_tabs() -> list[dict[str, Any]]:
    with urlopen(f"{CDP}/json/list", timeout=5) as r:
        return json.loads(r.read().decode())


def kill_brave() -> None:
    # Soft then hard — needed so the profile lock is released.
    subprocess.run(
        ["taskkill", "/IM", "brave.exe", "/F"],
        capture_output=True,
        text=True,
        check=False,
    )
    time.sleep(2)


def start_brave(extra_url: Optional[str] = None) -> None:
    if not Path(BRAVE_EXE).exists():
        raise SystemExit(f"Brave not found at {BRAVE_EXE}")
    if not Path(USER_DATA).exists():
        raise SystemExit(f"User data not found at {USER_DATA}")

    already = cdp_ready()
    if already:
        print(f"CDP already up on {CDP}")
        print(json.dumps(cdp_version(), indent=2))
        return

    print("Stopping Brave to re-open with remote debugging (keeps your profile)...")
    kill_brave()

    args = [
        BRAVE_EXE,
        f"--remote-debugging-port={PORT}",
        f"--user-data-dir={USER_DATA}",
        f"--profile-directory={PROFILE}",
        "--no-first-run",
        "--no-default-browser-check",
        "--restore-last-session",
    ]
    if extra_url:
        args.append(extra_url)

    # Detached so this process can exit while Brave stays open.
    creationflags = 0
    if sys.platform == "win32":
        creationflags = subprocess.DETACHED_PROCESS | subprocess.CREATE_NEW_PROCESS_GROUP  # type: ignore[attr-defined]

    subprocess.Popen(
        args,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        stdin=subprocess.DEVNULL,
        creationflags=creationflags,
        close_fds=True,
    )

    for i in range(40):
        time.sleep(0.5)
        if cdp_ready():
            print(f"Brave CDP ready: {CDP}")
            print(json.dumps(cdp_version(), indent=2))
            return
    raise SystemExit("Timed out waiting for Brave CDP")


def _pw():
    from playwright.sync_api import sync_playwright

    return sync_playwright()


def with_page(fn):
    if not cdp_ready():
        raise SystemExit(
            f"Brave CDP not reachable at {CDP}.\n"
            f"Run: python scripts/brave_cdp.py start"
        )
    with _pw() as p:
        browser = p.chromium.connect_over_cdp(CDP)
        context = browser.contexts[0] if browser.contexts else browser.new_context()
        page = context.pages[0] if context.pages else context.new_page()
        return fn(browser, context, page)


def cmd_status() -> None:
    if not cdp_ready():
        print(f"DOWN  {CDP}")
        sys.exit(1)
    print(f"UP    {CDP}")
    print(json.dumps(cdp_version(), indent=2))


def cmd_tabs() -> None:
    tabs = cdp_tabs()
    for t in tabs:
        if t.get("type") != "page":
            continue
        print(f"{t.get('id')}\t{t.get('title', '')[:60]}\t{t.get('url', '')}")


def cmd_open(url: str) -> None:
    def go(browser, context, page):
        page = context.new_page()
        page.goto(url, wait_until="domcontentloaded", timeout=60000)
        print(page.url)
        print(page.title())
        return page.url

    print(with_page(go))


def cmd_eval(js: str) -> None:
    def run(browser, context, page):
        return page.evaluate(js)

    print(with_page(run))


def cmd_text() -> None:
    def run(browser, context, page):
        return page.inner_text("body")[:4000]

    print(with_page(run))


def cmd_screenshot(path: str) -> None:
    def run(browser, context, page):
        page.screenshot(path=path, full_page=False)
        return path

    print("saved", with_page(run))


def cmd_click(selector: str) -> None:
    def run(browser, context, page):
        page.click(selector, timeout=15000)
        return f"clicked {selector}"

    print(with_page(run))


def cmd_fill(selector: str, text: str) -> None:
    def run(browser, context, page):
        page.fill(selector, text, timeout=15000)
        return f"filled {selector}"

    print(with_page(run))


def cmd_wait(ms: str) -> None:
    time.sleep(int(ms) / 1000.0)
    print("ok")


def cmd_polar_email() -> None:
    """Open Polar org settings and try to set business email + website (logged-in session)."""

    def run(browser, context, page):
        # Prefer dashboard settings pages (slugs differ by Polar version).
        candidates = [
            "https://polar.sh/dashboard/nexuscore/settings",
            "https://polar.sh/dashboard/settings",
            "https://polar.sh/dashboard",
            "https://polar.sh/nexuscore/settings",
        ]
        last = ""
        for url in candidates:
            page.goto(url, wait_until="domcontentloaded", timeout=60000)
            time.sleep(2)
            last = page.url
            print("navigated:", last)
            # If we landed on auth, stop — user session missing on this profile.
            if "auth" in last or "login" in last:
                print("NOT LOGGED IN on Polar in this Brave profile:", last)
                path = str(Path(os.environ.get("TEMP", ".")) / "brave-polar-auth.png")
                page.screenshot(path=path)
                print("screenshot", path)
                return last

        # Best-effort: fill email / website inputs if present.
        for sel, val in [
            ('input[type="email"]', SUPPORT_EMAIL),
            ('input[name="email"]', SUPPORT_EMAIL),
            ('input[placeholder*="email" i]', SUPPORT_EMAIL),
            ('input[name="website"]', WEBSITE),
            ('input[placeholder*="website" i]', WEBSITE),
            ('input[type="url"]', WEBSITE),
        ]:
            loc = page.locator(sel)
            try:
                n = loc.count()
            except Exception:
                n = 0
            if n:
                try:
                    loc.first.fill(val)
                    print(f"filled {sel} -> {val}")
                except Exception as e:
                    print(f"skip {sel}: {e}")

        path = str(Path(os.environ.get("TEMP", ".")) / "brave-polar-settings.png")
        page.screenshot(path=path, full_page=True)
        print("screenshot", path)
        print("body snippet:\n", page.inner_text("body")[:2000])
        return last

    print(with_page(run))


def cmd_cf_email() -> None:
    def run(browser, context, page):
        page.goto(
            "https://dash.cloudflare.com/",
            wait_until="domcontentloaded",
            timeout=60000,
        )
        time.sleep(3)
        print("url", page.url)
        path = str(Path(os.environ.get("TEMP", ".")) / "brave-cf-dash.png")
        page.screenshot(path=path)
        print("screenshot", path)
        print(page.inner_text("body")[:2500])
        # Try deep-link email routing for the zone name in search if logged in.
        if "login" not in page.url.lower() and "challenge" not in page.inner_text("body").lower()[:200]:
            page.goto(
                "https://dash.cloudflare.com/?to=/:account/agentapigw.dpdns.org/email/routing/routes",
                wait_until="domcontentloaded",
                timeout=60000,
            )
            time.sleep(3)
            print("email routing url", page.url)
            path2 = str(Path(os.environ.get("TEMP", ".")) / "brave-cf-email.png")
            page.screenshot(path=path2)
            print("screenshot", path2)
            print(page.inner_text("body")[:2500])
        return page.url

    print(with_page(run))


def cmd_improvmx() -> None:
    def run(browser, context, page):
        page.goto("https://app.improvmx.com/login", wait_until="domcontentloaded", timeout=60000)
        time.sleep(2)
        print("url", page.url)
        # If confirmation/login needed, open Gmail in another tab for the code.
        page2 = context.new_page()
        page2.goto("https://mail.google.com/mail/u/0/#search/improvmx", wait_until="domcontentloaded", timeout=60000)
        time.sleep(3)
        print("gmail", page2.url)
        path = str(Path(os.environ.get("TEMP", ".")) / "brave-improvmx.png")
        page.screenshot(path=path)
        path2 = str(Path(os.environ.get("TEMP", ".")) / "brave-gmail-improvmx.png")
        page2.screenshot(path=path2)
        print("screenshots", path, path2)
        print("improvmx body:\n", page.inner_text("body")[:1500])
        print("gmail body:\n", page2.inner_text("body")[:1500])
        return page.url

    print(with_page(run))


def main(argv: list[str]) -> None:
    if len(argv) < 2:
        print(__doc__)
        sys.exit(0)
    cmd = argv[1]
    if cmd == "start":
        start_brave(argv[2] if len(argv) > 2 else None)
    elif cmd == "status":
        cmd_status()
    elif cmd == "tabs":
        cmd_tabs()
    elif cmd == "open":
        cmd_open(argv[2])
    elif cmd == "eval":
        cmd_eval(argv[2])
    elif cmd == "text":
        cmd_text()
    elif cmd == "screenshot":
        cmd_screenshot(argv[2] if len(argv) > 2 else "brave-shot.png")
    elif cmd == "click":
        cmd_click(argv[2])
    elif cmd == "fill":
        cmd_fill(argv[2], argv[3])
    elif cmd == "wait":
        cmd_wait(argv[2])
    elif cmd == "polar-email":
        cmd_polar_email()
    elif cmd == "cf-email":
        cmd_cf_email()
    elif cmd == "improvmx":
        cmd_improvmx()
    else:
        raise SystemExit(f"Unknown command: {cmd}")


if __name__ == "__main__":
    main(sys.argv)
