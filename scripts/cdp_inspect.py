import json, time, urllib.request
import websocket

CDP = "http://127.0.0.1:9223"


def http_json(url, method="GET"):
    req = urllib.request.Request(url, method=method)
    with urllib.request.urlopen(req, timeout=15) as r:
        return json.loads(r.read().decode())


pages = http_json(f"{CDP}/json/list")
target = None
for p in pages:
    if p.get("type") == "page" and "resend.com" in (p.get("url") or ""):
        target = p
        break
if not target:
    target = http_json(f"{CDP}/json/new?https://resend.com/login", method="PUT")
    time.sleep(2)
    pages = http_json(f"{CDP}/json/list")
    for p in pages:
        if p.get("type") == "page" and "resend.com" in (p.get("url") or ""):
            target = p
            break

print("target", target.get("title"), target.get("url"))
ws = websocket.create_connection(target["webSocketDebuggerUrl"], timeout=15)
nid = 0


def call(method, params=None, timeout=20):
    global nid
    nid += 1
    msg = {"id": nid, "method": method}
    if params:
        msg["params"] = params
    ws.send(json.dumps(msg))
    end = time.time() + timeout
    while time.time() < end:
        data = json.loads(ws.recv())
        if data.get("id") == nid:
            if "error" in data:
                raise RuntimeError(data["error"])
            return data.get("result") or {}
    raise TimeoutError(method)


def ev(expr):
    r = call(
        "Runtime.evaluate",
        {"expression": expr, "returnByValue": True, "awaitPromise": True},
    )
    if r.get("exceptionDetails"):
        raise RuntimeError(str(r["exceptionDetails"])[:300])
    return (r.get("result") or {}).get("value")


call("Runtime.enable")
call("Page.enable")
print("href", ev("location.href"))
print("title", ev("document.title"))
body = ev("document.body ? document.body.innerText : ''") or ""
print("body", body[:1000].replace("\n", " | "))
btns = ev(
    """
[...document.querySelectorAll('button,a,input')].map(e => ({
  t: (e.textContent || e.value || '').trim().slice(0, 80),
  type: e.type || e.tagName,
  href: e.href || ''
})).filter(x => x.t || x.href).slice(0, 50)
"""
)
print("controls", json.dumps(btns, indent=2)[:2000])
ws.close()
