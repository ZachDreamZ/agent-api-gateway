# Self-Hosting Guide

Run the full Agent API Gateway for **$0/mo** using free-tier services.

## Zero-Cost Stack

| Service | Cost | What it does |
|---------|------|-------------|
| Oracle Cloud VPS | **$0/mo** | ARM 4-core, 24GB RAM — runs API + Playwright |
| Gemini Flash 2.0 | **$0/mo** | 1500 req/day free — LLM extraction |
| Supabase Free | **$0/mo** | 500MB DB, 50K users, 2GB bandwidth |
| In-memory cache | **$0/mo** | Built-in, no Redis needed |

Total: **$0/mo** (only pay for domain if you want one)

---

## Option A: Oracle Cloud VPS (recommended)

Free forever tier: 4 OCPU ARM, 24GB RAM, 200GB storage.

### 1. Create Oracle Free VPS

1. Sign up at [cloud.oracle.com](https://cloud.oracle.com) (requires CC for verification)
2. Create a VM instance:
   - Image: **Ubuntu 24.04 LTS** (or 22.04)
   - Shape: **VM.Standard.A1.Flex** (ARM)
   - OCPUs: **4**
   - Memory: **24 GB**
   - Boot volume: **200 GB**
3. Download SSH key, note the public IP

### 2. SSH in & install Docker

```bash
ssh ubuntu@<your-vm-ip>

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Log out and back in for group to take effect
exit
ssh ubuntu@<your-vm-ip>
```

### 3. Deploy the API

```bash
git clone https://github.com/your-org/agent-api-gateway.git
cd agent-api-gateway

# Set your free Gemini API key (get one at https://aistudio.google.com/apikey)
echo "GEMINI_API_KEY=AIza..." > .env

# Set Supabase (optional — get these from supabase.com dashboard)
echo "SUPABASE_URL=https://xxx.supabase.co" >> .env
echo "SUPABASE_SERVICE_ROLE_KEY=eyJ..." >> .env

# Start
docker compose up -d --build
```

### 4. Verify

```bash
curl http://localhost:3000/health
# → {"status":"ok","service":"agent-api-gateway","version":"0.1.0"}
```

### 5. Open firewall (optional)

```bash
sudo ufw allow 3000/tcp
# Then access via http://<vm-ip>:3000
```

---

## Option B: Render (free tier, simpler)

Easier setup but the VPS sleeps after 15 min of inactivity.

1. Push code to GitHub
2. Go to [dashboard.render.com](https://dashboard.render.com) → New + Web Service
3. Connect repo, use:
   - **Runtime**: Docker
   - **Plan**: Free
   - **Health Check Path**: `/health`
4. Add env vars:
   - `GEMINI_API_KEY`
   - `SUPABASE_URL` (optional)
   - `SUPABASE_SERVICE_ROLE_KEY` (optional)
5. Deploy

⚠️ Render free tier sleeps — API wakes in ~30s on first request.

---

## Option C: Railway (free credit)

New accounts get ~$5 credit (~2 months free).

1. Push to GitHub
2. Go to [railway.com](https://railway.com) → New Project → Deploy from GitHub
3. Add env vars same as above
4. Railway keeps the service awake unlike Render

---

## Setup Supabase (optional — needed for API key auth + billing)

The API works without Supabase for local dev, but full features need it.

1. [Create a Supabase account](https://supabase.com) (free)
2. Create a project
3. Go to SQL Editor → paste `supabase/schema.sql` → Run
4. Copy `Project Settings → API → Project URL` + `service_role key`

---

## Get a Gemini API Key (free)

1. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Click "Create API Key"
3. Copy the key, set as `GEMINI_API_KEY`

Free tier: 1500 requests/day, 60 requests/min. Enough for 45K queries/mo.

---

## Domain + TLS (optional, ~$0-10/yr)

```bash
# Cloudflare free plan: DNS + SSL
# 1. Point domain to your VPS IP via A record
# 2. Set up Caddy for auto-HTTPS:
docker run -d -p 80:80 -p 443:443 \
  -v caddy_data:/data \
  caddy caddy reverse-proxy \
  --from api.yourdomain.com \
  --to host.docker.internal:3000
```

---

## Updating

```bash
cd agent-api-gateway
git pull
docker compose up -d --build
```

---

## Cost Projections

| Scale | Monthly Cost |
|-------|-------------|
| Dev / personal (0-1K queries/mo) | **$0** |
| Early launch (1K-10K queries/mo) | **$0** (Gemini free tier) |
| Growing (10K-45K queries/mo) | **$0** (Gemini free tier limit) |
| Scaling (>45K queries/mo) | ~$20-50 (Gemini paid tier or switch to Claude) |

