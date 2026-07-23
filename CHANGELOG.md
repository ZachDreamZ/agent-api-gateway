# Changelog

All notable changes to Agent API Gateway will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Security.txt for responsible disclosure at /.well-known/security.txt
- Humans.txt for team transparency and credits
- Expanded FAQ section from 5 to 12 questions covering rate limits, caching, MCP, schemas, compliance, and performance
- Recent Requests empty state with illustration and CTA to docs
- Animated stats counters with smooth easing on Overview dashboard
- Error reporting with batched production error tracking
- Web Vitals tracking (CLS, INP, LCP, FCP, TTFB)
- Blog JSON-LD structured data (BlogPosting schema.org)
- Testimonials section with social proof from developer teams
- Comparison table on landing page (vs generic scrapers)
- RSS feed for blog at /blog/rss.xml

### Changed
- Improved landing page FAQ coverage and detail
- Enhanced dashboard Overview page with better empty states
- Optimized bundle splitting (landing 47KB, dashboard chunks lazy-loaded)

### Fixed
- TypeScript strict mode compliance across all components
- Duplicate empty state code removed from Overview.tsx

## [1.0.0] - 2026-07-20

### Added
- Initial production release
- Three extraction schemas: Product, Article, Company
- REST API with /v1/extract endpoint
- Dashboard with usage stats, API key management, billing
- Better Auth integration (email, GitHub, Google OAuth)
- Polar billing integration with credit packs
- SSRF protection for all URL inputs
- Redis caching layer (optional)
- Rate limiting per tier
- PostgreSQL database with migrations
- MCP server for Claude/Cursor integration
- Comprehensive documentation
- Blog with technical articles
- Sitemap.xml and robots.txt
- Open Graph and Twitter Card meta tags

### Security
- API key authentication with Bearer tokens
- Session-based auth for dashboard
- SSRF guard blocks private IPs and metadata endpoints
- CSP headers for XSS protection
- Rate limiting to prevent abuse
- Secrets redaction in logs

---

For older releases, see [GitHub Releases](https://github.com/ZachDreamZ/agent-api-gateway/releases).
