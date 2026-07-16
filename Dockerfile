FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY tsconfig.json ./
COPY src/ src/
COPY supabase/ supabase/
EXPOSE 3000
CMD ["npx", "tsx", "src/api/index.ts"]
