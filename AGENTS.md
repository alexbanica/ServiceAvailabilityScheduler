# AGENTS

Project: Service Availability Scheduler (Node.js + TypeScript + MariaDB).

## Purpose
This repository is a minimal service-claim scheduler with email-only login, timed reservations, and a small UI.

## Quick start
- Install deps: `npm install`
- Build: `npm run build`
- Configure DB: `export DATABASE_URL='mysql://user:password@host:3306/database_name'`
- Optional user seed: `export SEED_USERS='jane@example.com:Jane,alex@example.com:Alex'`
- Run: `npm start`
- App: `http://localhost:3000`

## Database
- Schema lives in `config/schema.sql`, but tables are auto-created on startup in `src/db.ts`.
- Seeding: `SEED_USERS` is a comma-separated list of `email:nickname` pairs; duplicates update nickname.
- Required tables: `users`, `reservations`.

## Project structure
- `src/service-availability-scheduler.ts`: app entrypoint
- `src/db.ts`: DB init, schema creation, user seeding
- `src/controllers/`: HTTP controllers
- `src/services/`: core domain services
- `src/repositories/`: DB access
- `config/`: YAML config + schema SQL
- `public/`: client assets

## Environment variables
- `DATABASE_URL` (required)
- `SEED_USERS` (optional)
- `PORT` (optional, default 3000)
- `SESSION_SECRET` (optional, default dev-secret-change-me)

## Testing
No test suite is configured. Validate changes by:
- Building: `npm run build`
- Running: `npm start`
- Manual smoke checks in browser

## Agent guidance
- Keep edits small and focused; prefer TypeScript in `src/`.
- Use ASCII-only text unless the file already contains Unicode.
- When changing behavior, update `README.md` if user-facing.
- Avoid destructive git commands; do not modify unrelated files.
