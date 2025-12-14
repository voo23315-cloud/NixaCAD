.PHONY: build start dev e2e

build:
	npm --prefix frontend run build
	npm --prefix backend run build

start:
	# start production backend
	node backend/dist/index.js &

dev:
	# start services via docker-compose for development
	docker compose up --build

e2e:
	# Run E2E smoke tests against a running backend at http://localhost:4000
	node scripts/e2e.js
