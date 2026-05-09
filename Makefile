.PHONY: help dev debug debug-inspect build start lint format type-check test test-unit test-integration \
        test-coverage docker-up docker-down docker-logs migrate migrate-revert clean

# Default target
help:
	@echo ""
	@echo "  Backend Boilerplate — available commands"
	@echo ""
	@echo "  Development"
	@echo "    make dev              Start dev server with hot-reload"
	@echo "    make debug            Start server with debugger (breaks on first line)"
	@echo "    make debug-inspect    Start server with debugger (no initial break)"
	@echo "    make build            Compile TypeScript to dist/"
	@echo "    make start            Run compiled production server"
	@echo ""
	@echo "  Code Quality"
	@echo "    make lint             Run ESLint"
	@echo "    make lint-fix         Run ESLint with auto-fix"
	@echo "    make format           Run Prettier (write)"
	@echo "    make format-check     Run Prettier (check only)"
	@echo "    make type-check       TypeScript type checking (no emit)"
	@echo ""
	@echo "  Testing"
	@echo "    make test             Run all tests"
	@echo "    make test-unit        Run unit tests only"
	@echo "    make test-integration Run integration tests only"
	@echo "    make test-coverage    Run all tests with coverage report"
	@echo ""
	@echo "  Docker"
	@echo "    make docker-up        Start all services (app + DBs)"
	@echo "    make docker-down      Stop all services"
	@echo "    make docker-logs      Tail app container logs"
	@echo "    make docker-build     Build the production Docker image"
	@echo ""
	@echo "  Database"
	@echo "    make migrate          Run pending TypeORM migrations"
	@echo "    make migrate-revert   Revert last TypeORM migration"
	@echo "    make migrate-generate name=MigrationName  Generate a new migration"
	@echo ""
	@echo "  Utilities"
	@echo "    make clean            Remove build artifacts"
	@echo "    make install          Install npm dependencies"
	@echo ""

# ── Development ──────────────────────────────────────────────────────────────
dev:
	npm run dev

debug:
	npm run debug

debug-inspect:
	npm run debug:inspect

build:
	npm run build

start:
	npm run start

# ── Code Quality ─────────────────────────────────────────────────────────────
lint:
	npm run lint

lint-fix:
	npm run lint:fix

format:
	npm run format

format-check:
	npm run format:check

type-check:
	npm run type-check

# ── Testing ───────────────────────────────────────────────────────────────────
test:
	npm run test

test-unit:
	npm run test:unit

test-integration:
	npm run test:integration

test-coverage:
	npm run test:coverage

# ── Docker ────────────────────────────────────────────────────────────────────
docker-up:
	docker compose up -d

docker-down:
	docker compose down

docker-logs:
	docker compose logs -f app

docker-build:
	docker build --target production -t backend-boilerplate:latest .

# ── Database (TypeORM) ────────────────────────────────────────────────────────
migrate:
	npm run migration:run

migrate-revert:
	npm run migration:revert

migrate-generate:
	npm run migration:generate -- src/infrastructure/postgres/migrations/$(name)

# ── Utilities ─────────────────────────────────────────────────────────────────
clean:
	rm -rf dist dist-test coverage

install:
	npm install
