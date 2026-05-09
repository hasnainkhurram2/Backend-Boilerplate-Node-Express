# Backend Boilerplate

A production-grade, cloneable backend boilerplate built with **TypeScript + Express**. Designed to be the starting point for any backend project — clone it, configure your databases, and start building.

## Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20 |
| Language | TypeScript (strict) |
| Framework | Express 4 |
| PostgreSQL ORM | TypeORM |
| MongoDB ODM | Mongoose |
| Cache / Sessions | Redis (ioredis) |
| Authentication | JWT + OAuth2 (Passport.js — Google) |
| Validation | Zod |
| Logging | Winston + Morgan |
| Testing | Jest + Supertest |
| Linting | ESLint + Prettier |
| Containers | Docker + Docker Compose |
| CI | GitHub Actions |

## Architecture

```
src/
├── server.ts                      # Entry point — connects DBs, starts HTTP server
├── app.ts                         # Express app factory — registers all middleware & routes
├── config/
│   └── env.ts                     # Zod-validated environment config (fails fast on bad vars)
├── infrastructure/
│   ├── postgres/data-source.ts    # TypeORM DataSource
│   ├── mongo/connection.ts        # Mongoose connect/disconnect
│   └── redis/client.ts            # ioredis singleton
├── modules/
│   ├── auth/                      # Register, login, refresh, logout, Google OAuth
│   └── users/                     # CRUD — entity (TypeORM), model (Mongoose), repo, service
├── shared/
│   ├── errors/AppError.ts         # Base HTTP error class with factory methods
│   ├── middleware/                # auth, error, validate, rate-limiter, logger
│   ├── utils/                     # jwt, password, api-response, pagination
│   └── types/                     # Shared TypeScript types
└── routes/index.ts                # Mounts all module routers under /api/v1
```

**Request flow:**
```
Client → Routes → Middleware (validate/auth/rate-limit) → Controller → Service → Repository → DB
```

Every response follows the same shape:
```json
{ "success": true, "message": "...", "data": {}, "meta": {} }
{ "success": false, "message": "...", "errors": {} }
```

## Quick Start

### 1. Clone and install

```bash
git clone <your-repo-url> my-project
cd my-project
npm install
```

### 2. Set up environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Start with Docker (recommended)

```bash
docker compose up -d
# App runs on http://localhost:3000
```

### 4. Or start manually

Make sure PostgreSQL, MongoDB, and Redis are running locally, then:

```bash
npm run dev
```

## Environment Variables

Copy `.env.example` to `.env`. All variables are validated at startup via Zod — the process exits immediately if anything is missing or invalid.

| Variable | Required | Default | Description |
|---|---|---|---|
| `NODE_ENV` | No | `development` | `development` / `production` / `test` |
| `PORT` | No | `3000` | HTTP port |
| `POSTGRES_HOST` | No | — | Omit to disable PostgreSQL |
| `POSTGRES_USER` | No | — | |
| `POSTGRES_PASSWORD` | No | — | |
| `POSTGRES_DB` | No | — | |
| `MONGO_URI` | No | — | Omit to disable MongoDB |
| `REDIS_HOST` | No | `localhost` | |
| `JWT_ACCESS_SECRET` | **Yes** | — | Min 32 chars |
| `JWT_REFRESH_SECRET` | **Yes** | — | Min 32 chars |
| `GOOGLE_CLIENT_ID` | No | — | OAuth2 — omit to disable Google login |
| `GOOGLE_CLIENT_SECRET` | No | — | |
| `GOOGLE_CALLBACK_URL` | No | — | |
| `CORS_ORIGIN` | No | `*` | Comma-separated origins or `*` |

## API Reference

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Public | Register a new user |
| `POST` | `/api/v1/auth/login` | Public | Login with email + password |
| `POST` | `/api/v1/auth/refresh` | Public | Refresh access token |
| `POST` | `/api/v1/auth/logout` | Bearer | Invalidate refresh token |
| `GET` | `/api/v1/auth/google` | Public | Start Google OAuth flow |
| `GET` | `/api/v1/auth/google/callback` | Public | Google OAuth callback |

### Users

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/users/me` | Bearer | Get current user profile |
| `PATCH` | `/api/v1/users/me` | Bearer | Update current user profile |
| `GET` | `/api/v1/users` | Admin | List all users (paginated) |
| `GET` | `/api/v1/users/:id` | Admin | Get user by ID |
| `DELETE` | `/api/v1/users/:id` | Admin | Delete user |

### Health

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/health` | Public | Health check |

## Available Commands

```bash
# Development
make dev                  # Start with hot-reload
make build                # Compile TypeScript
make start                # Run compiled server

# Code quality
make lint                 # ESLint
make lint-fix             # ESLint with auto-fix
make format               # Prettier (write)
make type-check           # TypeScript type checking

# Testing
make test                 # All tests
make test-unit            # Unit tests only
make test-integration     # Integration tests only
make test-coverage        # Tests with coverage report

# Docker
make docker-up            # Start all services
make docker-down          # Stop all services
make docker-logs          # Tail app logs
make docker-build         # Build production image

# Database (TypeORM)
make migrate              # Run pending migrations
make migrate-revert       # Revert last migration
make migrate-generate name=AddUserTable  # Generate migration
```

## Choosing Your Database

This boilerplate ships with both PostgreSQL and MongoDB wired up. Use whichever (or both) fits your project.

### PostgreSQL only (remove Mongo)

1. Remove `MONGO_URI` from your `.env`
2. Delete `src/infrastructure/mongo/`
3. Delete `user.model.ts` in each module
4. Uninstall: `npm uninstall mongoose`

### MongoDB only (remove Postgres)

1. Remove `POSTGRES_*` vars from your `.env`
2. Delete `src/infrastructure/postgres/`
3. Delete `user.entity.ts` in each module, update `user.repository.ts` to use Mongoose
4. Uninstall: `npm uninstall typeorm pg reflect-metadata`

## Adding a New Module

1. Create `src/modules/<name>/` with the following files:
   - `<name>.types.ts` — Zod schemas and TypeScript types
   - `<name>.entity.ts` — TypeORM entity (if using Postgres)
   - `<name>.model.ts` — Mongoose model (if using Mongo)
   - `<name>.repository.ts` — DB queries
   - `<name>.service.ts` — business logic
   - `<name>.controller.ts` — request/response handling
   - `<name>.routes.ts` — Express router

2. Mount the router in `src/routes/index.ts`:
   ```typescript
   import <name>Routes from '@/modules/<name>/<name>.routes';
   router.use('/<name>', <name>Routes);
   ```

3. If using TypeORM, add the entity to `data-source.ts` or let the glob pattern pick it up automatically.

## Testing

Unit tests live in `tests/unit/` and mock all repositories. Integration tests live in `tests/integration/` and run against real databases (started via Docker in CI).

```bash
# Run a specific test file
npx jest tests/unit/auth/auth.service.test.ts

# Run with verbose output
npx jest --verbose
```

## CI/CD

GitHub Actions runs on every push/PR to `main` or `develop`:

1. **Lint & Type Check** — ESLint + Prettier + `tsc --noEmit`
2. **Unit Tests** — no external services needed
3. **Integration Tests** — spins up Postgres, Mongo, Redis as service containers
4. **Docker Build** — validates the production image builds (on `main` only)

## Project Structure Conventions

- **One responsibility per file** — controllers only handle req/res; services own business logic; repositories own DB queries.
- **Error handling** — always `throw` an `AppError` from services; let the global error middleware format the response.
- **Validation** — use the `validate()` middleware with a Zod schema at the route level; never validate inside controllers or services.
- **Environment access** — only ever read from `env` (imported from `@/config`); never access `process.env` directly anywhere else.
- **Response shape** — always use `ApiResponse.success()` / `ApiResponse.error()` / `ApiResponse.created()` / `ApiResponse.noContent()`; never call `res.json()` directly in controllers.

## License

ISC
