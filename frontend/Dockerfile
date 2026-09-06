# syntax=docker/dockerfile:1

# ---------- base con dipendenze ----------
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---------- dev stage (hot reload, usato da docker-compose.override.yml) ----------
# node_modules e' "baked" nell'immagine: l'override monta solo src/, index.html,
# vite.config.ts e public/, quindi npm non gira mai su un bind mount.
FROM deps AS dev
WORKDIR /app
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

# ---------- build stage ----------
FROM deps AS build
WORKDIR /app

COPY . .

# Le VITE_* sono note al momento della build (vengono "inlined" nel bundle).
# Nessun segreto qui: solo configurazione pubblica.
ARG VITE_APP_ENV=production
ARG VITE_SENTRY_DSN=
ARG VITE_APP_RELEASE=
ARG VITE_DEBUG_ENDPOINTS=false
ENV VITE_APP_ENV=$VITE_APP_ENV \
    VITE_SENTRY_DSN=$VITE_SENTRY_DSN \
    VITE_APP_RELEASE=$VITE_APP_RELEASE \
    VITE_DEBUG_ENDPOINTS=$VITE_DEBUG_ENDPOINTS

RUN npm run build

# ---------- runtime stage ----------
FROM nginx:1.27-alpine AS run

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=10s --timeout=3s --retries=5 --start-period=5s \
  CMD wget -q --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
