# ─── Single-stage: run API + Playwright ───
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

# Install deps (omit dev deps we don't need: dashboard build)
RUN npm ci --omit=dev && npm install tsx

# Install Chromium for Playwright
RUN npx playwright install chromium

COPY src/ /app/src/

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npx", "tsx", "src/api/index.ts"]
