FROM node:22-slim AS deps
WORKDIR /app
ENV PUPPETEER_CACHE_DIR=/app/.cache/puppeteer
# unzip is required by Puppeteer's installer to extract the downloaded Chromium archive
RUN apt-get update && apt-get install -y --no-install-recommends unzip ca-certificates \
    && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm install

FROM node:22-slim AS builder
WORKDIR /app
ARG NEXT_PUBLIC_API_BASE_URL=/api
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PUPPETEER_CACHE_DIR=/app/.cache/puppeteer

# Chromium runtime libraries required by Puppeteer (Puppeteer itself supplies
# the Chromium binary, downloaded into PUPPETEER_CACHE_DIR during npm install)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libnss3 libatk1.0-0 libatk-bridge2.0-0 libx11-xcb1 libxcomposite1 \
    libxdamage1 libxrandr2 libgbm1 libasound2 libpangocairo-1.0-0 \
    fonts-liberation libcups2 libdrm2 libxkbcommon0 libxfixes3 libxss1 \
    libnspr4 libxext6 libxrender1 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=deps /app/.cache/puppeteer ./.cache/puppeteer
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
