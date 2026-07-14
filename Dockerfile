# ─── Stage 1: Build frontend ───
FROM node:22-slim AS frontend-builder

WORKDIR /app
COPY package*.json /app/

RUN npm ci --include=dev && npm install react-router-dom

COPY src/dashboard/ /app/src/dashboard/

RUN npx vite build src/dashboard --config src/dashboard/vite.config.ts

# ─── Stage 2: API + Playwright ───
FROM node:22-slim

# Playwright system deps (Bookworm-compatible names)
RUN apt-get update && apt-get install -y \
    libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 \
    libcups2 libdrm2 libdbus-1-3 libxkbcommon0 \
    libxcomposite1 libxdamage1 libxfixes3 libxrandr2 \
    libgbm1 libpango-1.0-0 libcairo2 libasound2 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json tsconfig.json .env.example /app/

# Install deps (omit dev deps)
RUN npm ci --omit=dev && npm install tsx

# Install Chromium for Playwright
RUN npx playwright install chromium

COPY src/ /app/src/

# Copy pre-built frontend
COPY --from=frontend-builder /app/dist/ /app/dist/

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npx", "tsx", "src/api/index.ts"]
