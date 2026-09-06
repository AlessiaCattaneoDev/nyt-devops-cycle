# syntax=docker/dockerfile:1
#
# Contesto di build: RADICE del repo (serve anche ./shared).
#   docker build -f backend/Dockerfile .
FROM node:22-alpine

ENV NODE_ENV=production
WORKDIR /app

# Layout speculare al repo cosi gli import relativi ../../shared funzionano identici
COPY backend/package.json backend/package-lock.json ./backend/
RUN cd backend && npm ci --omit=dev

COPY backend/src ./backend/src
COPY shared ./shared

WORKDIR /app/backend

EXPOSE 3001
USER node
HEALTHCHECK --interval=10s --timeout=3s --retries=5 --start-period=5s \
  CMD wget -q --spider http://localhost:3001/api/health || exit 1

CMD ["node", "src/server.js"]
