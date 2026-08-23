# What-If Audit - 100 Failure Scenarios

Legend: [OK] defended (verified or guarded in code) | [PART] partial defense | [GAP] unverified/open

## Traffic & Load (1-12)
1. What if 10x traffic hits landing page? [OK] static assets, CDN-cacheable HTML, immutable asset caching
2. What if 10x traffic hits /v1/extract? [OK] tier rate-limit middleware per user
3. What if anonymous flood hits public endpoints? [OK] global rate limit on API routes
4. What if Redis cache dies mid-day? [OK] falls back to in-memory cache
5. What if DB connection pool exhausts? [PART] pool limits exist; no circuit breaker on pool wait
6. What if Render free tier cold-starts? [PART] acceptable latency; no external uptime pinger configured
7. What if Playwright browser OOMs on huge page? [OK] scraper timeouts + fetch fallback path
8. What if 50 users hit Try-it demo simultaneously? [PART] demo uses same extract endpoint w/ rate limits
9. What if a bot hammers /sitemap.xml? [OK] static file serving
10. What if WebSocket-style long polls pile up? [N/A] no WS endpoints exposed publicly
11. What if queue backs up during LLM outage? [PART] sync requests fail fast; no retry queue yet
12. What if usage spikes burn free-tier credits instantly? [OK] credits checked pre-extraction

## Malicious Input & Security (13-34)
13. What if caller submits http://localhost:3000? [OK] SSRF guard blocks private hosts
14. What if caller submits 169.254.169.254 (cloud metadata)? [OK] SSRF guard blocks link-local
15. What if caller submits 10.x/192.168.x private IPs? [OK] SSRF guard blocks RFC1918
16. What if DNS rebinding swaps IP after check? [PART] guard resolves at fetch time; TOCTOU window documented
17. What if redirect chain hops to private IP? [OK] redirects re-validated by guard
18. What if URL is ftp:// or file://? [OK] scheme allowlist (http/https only)
19. What if payload is 50MB of JSON? [PART] API Content-Length is rejected above 1 MiB before auth/body parsing; chunked-body limits remain runtime-dependent
20. What if prompt injection inside scraped page hijacks extraction? [PART] schema validation constrains output shape
21. What if API key leaked in GitHub? [OK] sk- prefix scan via check:secrets; keys hashed in DB
22. What if XSS via extracted content echoed to dashboard? [OK] React escapes; no dangerouslySetInnerHTML on API data
23. What if SQLi through search/filter params? [OK] parameterized queries via drizzle/pg pool
24. What if auth cookie stolen? [PART] httpOnly+secure cookies; no device binding
25. What if CSRF on billing webhooks? [OK] Polar signature verification required
26. What if wildcard CORS sneaks back in prod? [OK] explicit origin allowlist; AGENTS.md forbids wildcard
27. What if CSP blocks our own new inline script? [PART] CSP nonce/hash strategy; new inline code must be reviewed
28. What if clickjacking frames the dashboard? [OK] X-Frame-Options/frame-ancestors deny
29. What if Bearer token replayed after revocation? [OK] auth.api.verifyApiKey checks DB status
30. What if email verification link intercepted? [PART] expiring tokens via Resend; console fallback logs links
31. What if admin route exposed accidentally? [OK] no public admin surface; ops via Render shell
32. What if dependency ships malware update? [PART] lockfile pinned; no automated npm audit gate in CI
33. What if secrets printed in structured logs? [OK] log redaction utility on error paths
34. What if user submits URL with embedded credentials (user:pass@host)? [OK] guard strips/rejects userinfo URLs

## Third-Party Outages (35-46)
35. What if Gemini API quota exhausts? [OK] engine priority falls back OpenRouter -> Claude
36. What if all LLM providers down? [OK] clear 503 error surfaced; cache serves warm results
37. What if Polar checkout is down? [OK] signup unaffected; upgrade shows friendly error
38. What if Polar webhook silently fails? [PART] retries configured on Polar side; manual reconcile possible
39. What if Resend email API dies? [OK] verification links fall back to server console
40. What if GitHub OAuth app disabled? [OK] Google OAuth remains; password login unaffected
41. What if DNS provider has outage? [PART] dpdns.org SPOF accepted for domain
42. What if CDN/Render region goes down? [PART] single-region deploys; no multi-region failover
43. What if fonts CDN changes break layout? [OK] fonts self-hosted - immune
44. What if lucide/motion packages vanish from npm? [OK] vendored via lockfile + dist committed
45. What if sitemap ping service dies? [OK] sitemap still served; crawlers find via robots.txt
46. What if status page (StatusPlate sister product) is down? [PART] health badge degrades gracefully

## Data & Content Edge Cases (47-62)
47. What if target page returns PDF/binary? [OK] content-type check rejects non-HTML
48. What if page is 10MB of minified JS soup? [OK] size caps + text extraction limits
49. What if page requires login to view? [OK] extracts public shell only; no credential stuffing feature
50. What if page is infinite-scroll SPA? [PART] best-effort initial DOM; documented limitation
51. What if page language is not English? [OK] LLM handles multilingual extraction
52. What if page has hostile unicode/homoglyphs? [OK] JSON-safe encoding on output
53. What if two users extract same URL concurrently? [OK] cache dedupes within TTL
54. What if schema type mismatches page content? [OK] validator flags missing fields; partial results returned
55. What if LLM hallucinates a field value? [PART] schema-constrained prompting reduces; no numeric sanity checks yet
56. What if cached result is stale (price changed)? [OK] TTL-bounded freshness; documented tradeoff
57. What if blog markdown has broken syntax? [OK] renderer is line-based and fault-tolerant
58. What if OG image deleted accidentally? [OK] og-image.png committed in repo; regenerated via script
59. What if sitemap lists deleted page? [OK] sitemap hand-curated alongside routes
60. What if RSS feed grows unbounded? [PART] feed.json/rss hold all posts; archive split needed >50 posts
61. What if user pastes URL with tracking params? [OK] extraction ignores query noise
62. What if IDN/punycode URL tricks the SSRF guard? [PART] normalized hostname compared post-punycode-decode

## Browser & Client Environments (63-76)
63. What if visitor disables JavaScript? [PART] SPA shell renders empty; core marketing copy in HTML meta only
64. What if visitor uses IE11/very old browser? [OK] graceful degradation via esbuild targets; no crash wall
65. What if ad-blocker strips analytics? [OK] no third-party analytics scripts currently
66. What if visitor has 2G/slow 3G? [OK] code-split chunks; fonts subset; lazy below-fold
67. What if localStorage disabled (Safari private)? [PART] auth session uses cookies; theme pref defaults gracefully
68. What if browser blocks third-party cookies? [OK] all cookies first-party same-origin
69. What if dark-mode OS preference conflicts? [OK] design is dark-first; forced colors respected
70. What if screen reader navigates playground? [OK] aria-labels on inputs/buttons; focus-visible rings
71. What if keyboard-only user tabs through nav? [OK] skip-link + visible focus states
72. What if mobile viewport rotates mid-session? [OK] responsive breakpoints fluid
73. What if print stylesheet requested? [GAP] no print styles - low priority
74. What if user has prefers-reduced-motion? [OK] Reveal + framer respect the media query
75. What if clipboard permission denied on Copy button? [PART] execCommand fallback attempted
76. What if browser autofill mangles API key input? [OK] autocomplete=off on sensitive fields

## Deploy & Infrastructure (77-86)
77. What if bad commit breaks build? [OK] typecheck+build gates before push; revert procedure documented
78. What if Vite chunk hash collision? [OK] content-hashed filenames; immutable caching safe
79. What if env var missing in prod? [OK] startup validation fails fast with clear message
80. What if migration runs twice? [PART] drizzle migrations idempotent guards
81. What if dist folder stale on deploy? [OK] Render builds fresh in pipeline
82. What if git history leaks old secret? [PART] rotate-first policy; no history rewrite tooling
83. What if Render auto-deploy paused silently? [PART] bundle-hash check catches drift (used in this loop)
84. What if healthcheck endpoint lies (200 but broken)? [PART] /health checks DB pool
85. What if disk fills from temp Chrome profiles? [OK] scraper cleans profiles; lh-runner isolated
86. What if clock skew breaks JWT expiry? [PART] Better Auth standard leeway applies

## SEO & Marketing Regressions (87-93)
87. What if title/meta accidentally removed? [OK] index.html committed; Lighthouse SEO gate = 100
88. What if robots.txt blocks crawlers? [OK] allows all; sitemap referenced
89. What if canonical points to wrong host? [OK] absolute canonical to agentapigw.dpdns.org
90. What if new page forgotten in sitemap? [PART] checklist habit; caught 2 missing entries this session
91. What if blog post slug collides? [PART] unique slugs enforced manually; no runtime guard
92. What if OG image 404s after rename? [OK] static route serves /og-image.png directly
93. What if structured data JSON-LD malformed? [OK] validated in-browser this session; types parse clean

## Business & Billing Edges (94-100)
94. What if webhook arrives before user row commits? [PART] Polar retry + idempotent upsert
95. What if refund issued outside Polar? [PART] manual tier adjustment runbook
96. What if free-tier user automates 1000 signups? [OK] email verification + rate limits raise cost
97. What if pricing page shows stale tiers vs API enforcement? [OK] shared tier catalog module used by both
98. What if credit balance goes negative mid-request? [OK] atomic debit check before extraction starts
99. What if customer disputes charge - need audit trail? [OK] structured billing event logs retained
100. What if founder loses laptop/2FA? [PART] GitHub org recovery documented; Polar dashboard 2FA recovery via support
