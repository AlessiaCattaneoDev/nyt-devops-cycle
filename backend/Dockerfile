# syntax=docker/dockerfile:1
#
# Contesto di build: ./backend
FROM node:22-alpine

ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY src ./src

EXPOSE 3001
USER node
HEALTHCHECK --interval=10s --timeout=3s --retries=5 --start-period=5s \
  CMD wget -q --spider http://localhost:3001/api/health || exit 1

CMD ["node", "src/server.js"]
