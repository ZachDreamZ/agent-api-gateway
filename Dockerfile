# ─── Stage 1: Build frontend ───
FROM node:22-slim AS frontend-builder

WORKDIR /app
COPY package*.json /app/

RUN npm install --legacy-peer-deps && npm install react-router-dom

COPY src/dashboard/ /app/src/dashboard/

RUN npx vite build src/dashboard --config src/dashboard/vite.config.ts

# ─── Stage 2: API only (no Playwright — reduces build time 5x) ───
FROM node:22-slim

WORKDIR /app
COPY package*.json tsconfig.json .env.example supabase/ /app/

# Install production deps only
RUN npm install --omit=dev --legacy-peer-deps && npm install tsx

COPY src/ /app/src/

# Copy pre-built frontend
COPY --from=frontend-builder /app/dist/ /app/dist/

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npx", "tsx", "src/api/index.ts"]
