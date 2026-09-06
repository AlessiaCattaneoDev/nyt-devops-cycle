# NYT DevOps Cycle

Ciclo DevOps completo attorno a una Single Page Application React: dall'ambiente
locale containerizzato al deploy pubblico automatico, con pipeline CI/CD,
gestione dei secret e monitoraggio (uptime + error tracking).

Progetto realizzato per il modulo **DevOps** del Master, a partire da un
progetto sviluppato durante il percorso:
[AlessiaCattaneoDev/NewYorkTimesProject](https://github.com/AlessiaCattaneoDev/NewYorkTimesProject).

| Risorsa | Link |
| --- | --- |
| URL pubblico (produzione) | <https://nyt-devops-cycle-omega.vercel.app> |
| Pipeline CI/CD | <https://github.com/AlessiaCattaneoDev/nyt-devops-cycle/actions> |
| Dashboard Sentry | _da compilare_ |
| Uptime monitor | _da compilare_ |

> Il design e il runbook operativo sono mantenuti come documenti locali in
> `docs/` (non versionati).

---

## 1. Esplorazione — cosa stiamo deployando

### L'app in breve

**NYT Clone** è una SPA che ricrea la homepage del New York Times.

- **Stack:** React 19 + TypeScript, build con Vite, styling Tailwind CSS v4,
  routing con React Router v7 (in modalità `HashRouter`), stato globale con
  Context API + `useReducer`, HTTP con Axios.
- **Cosa fa:** all'avvio carica le sei sezioni editoriali (World, U.S.,
  Politics, Business, Technology, Arts) dalla **Top Stories API** del NYT e la
  sidebar "Most read" dalla **Most Popular API**. Le pagine di dettaglio
  articolo rimandano all'articolo originale su nytimes.com. Tema chiaro/scuro
  persistito in `localStorage`.
- **Niente backend, niente database, niente autenticazione.** L'unico stato
  server-side sono le API pubbliche del NYT.
- **Un problema da correggere:** le API key NYT erano variabili `VITE_*`, che
  Vite **inserisce staticamente nel bundle JavaScript** servito al browser —
  chiunque apra i DevTools le legge. Il ciclo DevOps risolve questo, non lo
  ripropone.

### La soluzione: BFF proxy

Si introduce un **Backend For Frontend**: un servizio Express che inoltra le
chiamate all'API NYT e **tiene le chiavi lato server in ogni ambiente**. Il
frontend chiama solo path relativi `/api/nyt/*` e non conosce né la chiave né
l'host del NYT.

Lo **stesso** servizio Express gira in entrambi gli ambienti — in locale come
container `backend` di docker-compose, in cloud come *service* del progetto
Vercel (progetto multi-service, vedi [`vercel.json`](vercel.json)):

```
                    ┌────────────────────────── development (locale) ─────────────────────────┐
  Browser  ──/api──▶ │  nginx / vite dev  ──▶  backend Express (BFF)  ──api-key──▶  api.nytimes.com │
                    └───────────────────────────── docker-compose ───────────────────────────┘

                    ┌──────────────────── staging / production (Vercel) ──────────────────────┐
  Browser  ─────────▶ │  frontend service (Vite build)                                          │
           /api  ────▶ │  backend service (Express, stesso codice)  ──api-key──▶  api.nytimes.com │
                    └────────────────────────────────────────────────────────────────────────┘
```

Il proxy vive in [`backend/src/nytProxy.mjs`](backend/src/nytProxy.mjs)
(allowlist delle sezioni, cache TTL, normalizzazione degli errori); le rotte
Express lo montano su `/api/nyt/*`.

### I tre ambienti

| Ambiente | Dove gira | Scopo | Config / secret | Si attiva con |
| --- | --- | --- | --- | --- |
| **development** | Locale, `docker compose up` | Sviluppo, hot reload, iterazione veloce | `.env` locale (gitignored): chiavi NYT di sviluppo, `APP_ENV=development`, Sentry disattivato | comando manuale |
| **staging** | Vercel **Preview Deployment** | Validare ogni Pull Request prima del merge; URL usa-e-getta | Vercel env *Preview*: chiavi NYT, `APP_ENV=staging`, `SENTRY_ENVIRONMENT=staging` | apertura/aggiornamento di una PR verso `main` |
| **production** | Vercel **Production** | Ambiente pubblico servito agli utenti | Vercel env *Production*: chiavi NYT, `APP_ENV=production`, `SENTRY_ENVIRONMENT=production` | push/merge su `main`, dopo CI verde |

### Strumenti: perché GitHub Actions (e non GitLab CI)

- Il repository è su **GitHub** → integrazione nativa, runner gratuiti, nessuna
  infrastruttura CI da gestire.
- Il target di deploy (**Vercel**) ha CLI e action ufficiali; il progetto
  originale già pubblicava da GitHub.
- Marketplace maturo per gli step richiesti: `gitleaks` (secret scan),
  `docker/build-push-action`, `actions/setup-node`.
- **Secrets mascherati** in automatico nei log e **Environments** con
  protection rule integrati.
- GitLab CI richiederebbe di eseguire il mirror o migrare il repo: attrito
  senza benefici per questo progetto.

---

## 2. Struttura del repository

```
nyt-devops-cycle/
├── frontend/                 # SPA React (sorgente vendored + refactor: chiama solo /api/nyt/*)
│   ├── Dockerfile            # multi-stage: build Node → runtime nginx
│   ├── nginx.conf            # SPA fallback + proxy /api → backend:3001 (solo compose)
│   └── src/…                 # + src/lib/monitoring.ts (Sentry), src/pages/DebugBoom.tsx
├── backend/                  # servizio BFF Express (locale via compose, cloud come service Vercel)
│   ├── Dockerfile            # node:22-alpine, CMD node src/server.js
│   ├── nytProxy.test.mjs     # unit test del proxy (node:test)
│   └── src/
│       ├── server.js         # app Express: helmet, cors, rate-limit, error handler → Sentry
│       ├── routes.js         # /api/health, /api/nyt/topstories/:section, /api/nyt/mostpopular, /api/debug/boom
│       ├── nytProxy.mjs      # proxy NYT: allowlist sezioni, cache TTL, normalizzazione errori
│       └── observability.mjs # transport Sentry via fetch (no-op senza DSN)
├── .github/workflows/main.yml   # pipeline CI (+ nota CD)
├── docker-compose.yml           # ambiente locale: nginx (frontend) + BFF Express (backend)
├── docker-compose.dev.yml       # override opt-in: hot reload con vite dev server
├── vercel.json                  # progetto multi-service: frontend (vite) + backend, rewrite /api → backend
├── .env.example                 # template dei secret (il vero .env NON è committato)
└── .gitignore  .prettierrc.json  .editorconfig

# docs/  — design e runbook operativo, mantenuti in locale (non versionati)
```

---

## 3. Prerequisiti

- **Docker** e **Docker Compose v2.24+**
- **Node.js 22** e npm (per lavorare fuori da Docker)
- Due **API key del NYT** — [developer.nytimes.com/apps](https://developer.nytimes.com/apps)
- `git` e la **GitHub CLI** (`gh`) autenticata, per i passi del runbook

---

## 4. Avvio in locale (ambiente development)

### 4.1 Configura i secret

```bash
cp .env.example .env
# apri .env e inserisci NYT_TOP_STORIES_KEY e NYT_MOST_POPULAR_KEY
```

`.env` è in `.gitignore` e non deve **mai** essere committato (vedi §6).

### 4.2 Avvio dello stack (default)

```bash
docker compose up --build
```

Avvia due servizi: il **frontend** servito da **nginx** a partire dalla build
statica (identico all'immagine validata in CI) e il **BFF Express**. nginx
inoltra `/api` a `backend:3001`.

| Servizio | URL | Note |
| --- | --- | --- |
| Frontend | <http://localhost:8080> | proxy `/api` → `backend:3001` |
| Backend (health) | <http://localhost:8080/api/health> · <http://localhost:3001/api/health> | `{"status":"ok","env":"development"}` |

### 4.3 Sviluppo con hot reload

**Opzione A — Vite sull'host (consigliata, sempre affidabile):**

```bash
docker compose up -d backend          # solo il BFF nel container
cd frontend && npm install && npm run dev
# Vite su http://localhost:5173, /api inoltrato a localhost:3001 (vedi vite.config.ts)
```

**Opzione B — hot reload in container (opt-in):**

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

Sostituisce nginx con il dev server Vite (bind mount di `frontend/`). Su
**Docker Desktop per macOS** il file-watching nativo sui bind mount può dare
errori intermittenti `os error 35`: in quel caso usa l'opzione A.

### 4.4 Verifica che tutto risponda

```bash
curl -s http://localhost:8080/                     # HTML della SPA
curl -s http://localhost:8080/api/health           # {"status":"ok",...}
curl -s "http://localhost:8080/api/nyt/topstories/world" | head -c 300
curl -s "http://localhost:8080/api/nyt/mostpopular?days=7" | head -c 300
```

Con una chiave errata/dummy il proxy restituisce il **401 del NYT** così com'è
(`{"error":"nyt_upstream_error","upstreamStatus":401,...}`): è la prova che il
wiring frontend → BFF → NYT è completo.

### 4.5 Comandi utili

```bash
docker compose ps                 # stato dei servizi + healthcheck
docker compose logs -f backend    # log del BFF
docker compose down               # ferma e rimuove i container
docker compose down -v            # + rimuove i volumi (node_modules del frontend dev)

# fuori da Docker
cd frontend && npm install && npm run dev      # solo frontend (proxy → localhost:3001)
cd backend  && npm install && npm run dev      # solo BFF, con --watch
npm --prefix backend test                      # unit test del proxy
```

---

## 5. CI/CD — [.github/workflows/main.yml](.github/workflows/main.yml)

Un unico workflow, attivato **a ogni push su `main`** e **a ogni PR verso
`main`**.

### Stage CI (bloccante)

| Job | Cosa fa | Fallisce se |
| --- | --- | --- |
| `lint` | `npm ci` su frontend e backend, `oxlint` su entrambi, `prettier --check .` | lint o formattazione non conformi |
| `typecheck` | `tsc -b --noEmit` sul frontend | errori di tipo |
| `test-proxy` | `node --test` sulla logica del BFF | un test rosso |
| `secret-scan` | `gitleaks` sull'intera history git | trova un potenziale secret |
| `bundle-hygiene` | build del frontend + `grep` su `dist/` | una chiave NYT o `api.nytimes.com` è finita nel bundle |
| `build-images` | build immagini Docker `frontend` e `backend` + smoke test `curl /api/health` sul container | build fallita o container non healthy |
| `ci-ok` | gate aggregante — è lo **status check richiesto** dalla branch protection | uno qualsiasi dei job sopra è rosso |

**Il linting che non passa blocca la pipeline in modo visibile:** `oxlint`
esce con codice ≠ 0 → il job `lint` diventa rosso → `ci-ok` non parte → il
deploy non parte e (con la branch protection attiva) la PR non è
mergeabile. Il runbook locale descrive la dimostrazione con un errore di
lint volontario.

### Stage CD — integrazione Git di Vercel

Il deploy **non** passa da GitHub Actions: è l'**integrazione Git di Vercel**
(progetto multi-service in [`vercel.json`](vercel.json)) a gestirlo.

| Evento | Deploy Vercel |
| --- | --- |
| push su `main` | **Production** |
| Pull Request verso `main` | **Preview** (staging), URL commentato sulla PR |

Vercel è configurato per attendere i check di GitHub (*Settings → Git →
deployment protection*): builda solo se la CI è verde. Quindi **ogni push su
`main` che supera la CI arriva in produzione senza interventi manuali**. Il job
`cd-info` nel workflow lo segnala nel summary.

### Secret

- **La pipeline CI non usa alcun secret** (niente token, niente `VERCEL_*`).
- Le **chiavi NYT** e i **DSN Sentry** sono *Environment Variables* del
  progetto Vercel (scope Production/Preview) — è lì che gira il servizio
  backend a runtime. Mai nel repo, mai nel bundle.

---

## 6. Sicurezza e gestione dei secret

| Pratica | Come è implementata |
| --- | --- |
| Secret fuori dal repo | tutte le chiavi in `.env` (locale) o nelle env di Vercel; nel repo solo `.env.example` con placeholder |
| `.env` mai committato | `.env` e `.env.*` in [.gitignore](.gitignore) (`!.env.example` come eccezione) |
| Verifica sulla history | `git log --all --full-history -- .env` (vuoto) + job `secret-scan` (gitleaks) a ogni push come guardia permanente |
| Secret nel repo remoto | nessuno: il deploy è di Vercel, la CI non usa secret |
| Nessun secret nei log della pipeline | solo GitHub Secrets (output `***`); nessun `echo` di variabili sensibili; `--token` passato via `env:` |
| Chiave fuori dal bundle | il frontend non ha più variabili `VITE_NYT_*`; il job `bundle-hygiene` fallisce se una chiave rientra in `dist/` |
| Hardening del BFF | `helmet`, CORS ristretto agli origin noti, `express-rate-limit` |

Checklist completa di verifica nel runbook locale (`docs/runbook.md`).

---

## 7. Monitoraggio

### Uptime — UptimeRobot

Due monitor sull'URL di produzione, intervallo 5 minuti, alert via email:

1. **HTTP(s)** sulla home (`/`)
2. **Keyword** su `/api/health`, deve contenere `ok`

### Error tracking — Sentry

- **Frontend:** `@sentry/react` inizializzato in
  [`src/lib/monitoring.ts`](frontend/src/lib/monitoring.ts), con
  `Sentry.ErrorBoundary` attorno all'app. Attivo solo se `VITE_SENTRY_DSN` è
  impostato.
- **Backend:** transport Sentry minimale via `fetch` in
  [`backend/src/observability.mjs`](backend/src/observability.mjs) — nessuna
  dipendenza, no-op con fallback su `console.error` se `SENTRY_DSN_BACKEND`
  non è impostato. L'error handler di Express chiama `captureError`.

### Simulare un errore (step "Simula autonomamente un errore")

| Percorso | Come | Cosa aspettarsi |
| --- | --- | --- |
| Frontend | apri `<url>/#/debug/boom` e premi "Genera errore" | fallback dell'ErrorBoundary + nuova issue in Sentry (progetto frontend) |
| Backend (locale) | `curl http://localhost:8080/api/debug/boom` | `500 {"error":"internal_error"}` + issue in Sentry (progetto backend) |
| Backend (Vercel) | `curl <url>/api/debug/boom` con `DEBUG_ENDPOINTS=true` | `500 {"error":"internal_error"}` + issue in Sentry |

Le rotte di debug sono attive solo se `APP_ENV !== 'production'` **oppure**
`DEBUG_ENDPOINTS=true` / `VITE_DEBUG_ENDPOINTS=true`. In produzione si abilita
il flag il tempo della demo e poi si rimuove (runbook §8).

### Come interpretare gli alert

**Alert "Down" da UptimeRobot**

1. Apri l'URL di produzione nel browser: errore di rete, 500, o pagina bianca?
2. Vercel → **Deployments**: l'ultima deploy è andata a buon fine? Quando?
3. `curl <url>/api/health`:
   - non risponde → problema di hosting/DNS/Vercel → controlla
     [vercel-status.com](https://www.vercel-status.com/)
   - risponde `ok` ma il sito è rotto → regressione nel frontend
     dell'ultima deploy
4. **Mitigazione:** in Vercel, `Deployments → … → Promote to Production` sulla
   build precedente sana (oppure `vercel rollback`). Poi indaga con calma.

**Nuova issue da Sentry**

1. **Tag `environment`**: `production` (impatta gli utenti) o `staging`
   (l'ha intercettato la PR)?
2. **Stack trace + breadcrumbs**: quale componente/endpoint, cosa faceva
   l'utente, quale richiesta di rete precede l'errore.
3. **Tag `release` / `First seen`**: da quale deploy è comparso → apri il
   diff di quel commit.
4. **`events` / `users affected`**: 1 evento isolato (rumore, valuta
   *mute*) o curva in crescita (incidente)?

**Tabella severità**

| Sev | Definizione | Risposta attesa |
| --- | --- | --- |
| **Sev1** | Sito irraggiungibile o build di produzione rotta | subito · rollback entro ~15 min |
| **Sev2** | Una funzionalità chiave non va (una sezione non carica, la sidebar è vuota) | in giornata |
| **Sev3** | Cosmetico o errore raro non bloccante | backlog |

---

## 8. Stato della pianificazione

| Fase | Deliverable | Stato |
| --- | --- | --- |
| Esplorazione | analisi app, 3 ambienti, scelta strumenti, README | ✅ questo documento + spec locale |
| Containerizzazione | Dockerfile frontend, docker-compose FE+BE, avvio locale | ✅ [frontend/Dockerfile](frontend/Dockerfile), [backend/Dockerfile](backend/Dockerfile), [docker-compose.yml](docker-compose.yml) |
| Sicurezza e secret | `.env` + `.gitignore`, GitHub Secrets, no leak nei log | ✅ config nel repo · ⏳ passi manuali (runbook locale) |
| Pipeline CI | lint + build container a ogni push su `main`, fallimento visibile | ✅ [main.yml](.github/workflows/main.yml) · ⏳ push iniziale + screenshot |
| Pipeline CD + deploy | deploy automatico su Vercel (integrazione Git), URL pubblico | ✅ live: <https://nyt-devops-cycle-omega.vercel.app> |
| Monitoraggio | UptimeRobot + Sentry, errore simulato, lettura alert | ✅ codice + questa sezione · ⏳ setup dashboard (runbook locale) |

I passi ⏳ richiedono account/dashboard esterni e sono descritti comando per
comando nel runbook locale (`docs/runbook.md`, non versionato).
