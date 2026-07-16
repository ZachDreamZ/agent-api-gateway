FROM node:22-alpine
WORKDIR /app

# Copy dependency manifests and install ALL deps (including dev for Vite build)
COPY package*.json ./
RUN npm install

# Copy source files
COPY tsconfig.json ./
COPY src/ src/
COPY supabase/ supabase/

# Typecheck + build dashboard (vite)
RUN npx tsc --noEmit && npx vite build src/dashboard

EXPOSE 3000
CMD ["npx", "tsx", "src/api/index.ts"]
