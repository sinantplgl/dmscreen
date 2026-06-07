# ── Stage 1: build the static site ──────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
COPY package.json package-lock.json* ./
RUN npm ci || npm install
COPY . .
RUN npm run build

# ── Stage 2: tiny Node server (serves dist + /ddb-api proxy) ──────────────────
# No browser is installed in the image. The "rendered" scrape works only if you
# point BROWSER_CDP_URL at a headless browser running on the HOST (see README /
# docker-compose.yml). The playwright *library* is installed (for CDP connect),
# but the ~100MB browser binary is intentionally skipped.
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=8080 PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev || npm install --omit=dev
COPY --from=build /app/dist ./dist
COPY server ./server
EXPOSE 8080
CMD ["node", "server/serve.mjs"]
