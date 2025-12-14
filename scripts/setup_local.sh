#!/usr/bin/env bash
set -euo pipefail

# Simple local setup helper for development
# - copies .env.example to .env unless .env exists
# - starts docker compose (Postgres)
# - waits for Postgres to be ready
# - generates Prisma client and runs seed
# - starts backend and frontend dev servers in background

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

MODE="dev"
for arg in "$@"; do
  case "$arg" in
    --prod) MODE="prod" ;;
  esac
done

if [ ! -f .env ]; then
  echo "Creating .env from .env.example"
  cp .env.example .env
  # ensure a sensible DATABASE_URL for local docker-compose
  if ! grep -q DATABASE_URL .env; then
    echo "DATABASE_URL=postgresql://nixacad:password@localhost:5432/nixacad" >> .env
  else
    # try to set default DB if empty
    sed -i "s|^DATABASE_URL=.*|DATABASE_URL=postgresql://nixacad:password@localhost:5432/nixacad|" .env
  fi
  if ! grep -q JWT_SECRET .env; then
    echo "JWT_SECRET=changeme" >> .env
  fi
fi

echo "Starting services with docker compose..."
docker compose up -d db

# Wait for Postgres
N=0
until docker compose exec -T db pg_isready -U nixacad >/dev/null 2>&1; do
  N=$((N+1))
  if [ $N -ge 60 ]; then
    echo "Postgres did not become ready in time" >&2
    exit 1
  fi
  sleep 1
done

echo "Postgres ready. Generating Prisma client and seeding DB..."

npm --prefix backend install --no-audit --no-fund
npm --prefix backend run prisma:generate -- --schema=./prisma/schema.prisma
npx ts-node backend/prisma/seed.ts
if [ "$MODE" = "prod" ]; then
  echo "Building backend & frontend for production..."
  npm --prefix backend run build
  npm --prefix frontend install --no-audit --no-fund
  npm --prefix frontend run build

  echo "Starting production backend (node backend/dist/index.js)..."
  node backend/dist/index.js &>/tmp/nixacad-backend-prod.log &

  # wait for backend health
  n=0
  until curl -sS http://localhost:4000/api/health >/dev/null 2>&1; do
    n=$((n+1))
    if [ $n -ge 30 ]; then
      echo "Backend did not become ready in time" >&2
      exit 1
    fi
    sleep 1
  done

  echo "Starting frontend preview (vite preview) on port 5173..."
  npm --prefix frontend run preview -- --port 5173 --host &>/tmp/nixacad-frontend-prod.log &

  echo "Production setup complete. Backend logs: /tmp/nixacad-backend-prod.log"
  echo "Frontend logs: /tmp/nixacad-frontend-prod.log"
  echo "Open http://localhost:5173 and run node scripts/e2e.js to verify."
else
  echo "Starting backend dev server..."
  # start backend dev server (ts-node-dev) in background
  npm --prefix backend run dev &>/tmp/nixacad-backend-dev.log &

  echo "Starting frontend dev server..."
  npm --prefix frontend install --no-audit --no-fund
  npm --prefix frontend run dev &>/tmp/nixacad-frontend-dev.log &

  echo "Setup complete. Backend logs: /tmp/nixacad-backend-dev.log"
  echo "Frontend logs: /tmp/nixacad-frontend-dev.log"
  echo "You can now open http://localhost:5173 and run node scripts/e2e.js to verify."
fi