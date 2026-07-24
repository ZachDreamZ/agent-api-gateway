from pathlib import Path

p = Path("src/dashboard/src/app.tsx")
t = p.read_text(encoding="utf-8")

old = "const Mcp = lazy(() => import('./pages/Mcp'));\nimport { useSession, signOut } from './lib/auth';"
new = "const Mcp = lazy(() => import('./pages/Mcp'));\nconst Pricing = lazy(() => import('./pages/Pricing'));\nconst Alternatives = lazy(() => import('./pages/Alternatives'));\nimport { useSession, signOut } from './lib/auth';"
if old not in t:
    raise SystemExit("lazy block missing")
t = t.replace(old, new, 1)

old2 = "        <Route path=\"/mcp\" element={<Mcp />} />\n        <Route path=\"/login\" element={<Auth />} />"
new2 = "        <Route path=\"/mcp\" element={<Mcp />} />\n        <Route path=\"/pricing\" element={<Pricing />} />\n        <Route path=\"/alternatives\" element={<Alternatives />} />\n        <Route path=\"/alternatives/:slug\" element={<Alternatives />} />\n        <Route path=\"/login\" element={<Auth />} />"
if old2 not in t:
    raise SystemExit("route block missing")
t = t.replace(old2, new2, 1)

p.write_text(t, encoding="utf-8")
print("app.tsx updated")
