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

4. Frontend: (noch Skeleton) in `frontend/` — siehe Projektstruktur.

Weitere Details in den jeweiligen Ordnern: `backend/`, `database/`, `frontend/`.