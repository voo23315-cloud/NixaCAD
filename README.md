# NixaCAD

NixaCAD — ein webbasiertes, PostgreSQL-basiertes CAD-System für Roleplay (RP). Dieses Repository enthält ein Minimal-Skelett für Backend, Datenbankschema und Dokumentation, damit du lokal entwickeln und die Datenbank später auf einem anderen Host betreiben kannst.

Quickstart (lokal, mit Docker Compose):

1. Kopiere `.env.example` → `.env` und passe `DATABASE_URL` an.
2. Starte Postgres:

```bash
docker compose up -d
```

3. Im Backend-Ordner: Abhängigkeiten installieren und Migration anwenden (Beispiel mit npm):

```bash
cd backend
npm install
npx prisma generate --schema=prisma/schema.prisma
npx ts-node prisma/seed.ts
npm run dev
```

4. Frontend: (noch Skeleton) in `frontend/` — siehe Projektstruktur. Produktion-Builds benötigen Node ESM-Unterstützung; falls Docker-Frontend-Build fehlschlägt, baue lokal mit `npm run build` und prüfe `vite` Version / `@vitejs/plugin-react`.

E2E Smoke Test

```bash
# Start services (db + dev servers)
docker compose up -d
cd backend && npm install && npx prisma generate --schema=prisma/schema.prisma && npx ts-node prisma/seed.ts && npm run dev &
cd frontend && npm install && npm run dev &
# In another terminal
node scripts/e2e.js
```

Weitere Details in den jeweiligen Ordnern: `backend/`, `database/`, `frontend/`.

## Testing & CI

- Local production build and test:

```bash
# Build frontend & backend
make build

# Start the production backend in background
make start

# Run E2E smoke tests
make e2e
```

You can also run the provided setup script in production mode which builds and starts the services for you:

```bash
./scripts/setup_local.sh --prod
node scripts/e2e.js
```

Hinweis: Die Produktions‑Preview läuft nun auf http://localhost:5173 (früher verwendet Vite `preview` standardmäßig Port 4173).
```

- Development (docker):

```bash
make dev
```

- CI: A GitHub Actions workflow runs on push/pull_request to `main` (see `.github/workflows/ci.yml`). It applies SQL migrations, builds frontend and backend, starts the backend and runs the E2E smoke tests.