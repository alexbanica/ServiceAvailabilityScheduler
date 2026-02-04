# Service Availability Scheduler

Minimal Node.js app to claim services per environment with email-only login and timed reservations.

## Setup

1) Install dependencies

```bash
npm install
```

2) Build the TypeScript server and frontend

```bash
npm run build
```

3) Create the database in MariaDB (tables are created automatically on startup)

4) Set your MariaDB connection string

```bash
export DATABASE_URL='mysql://user:password@host:3306/database_name'
```

5) (Optional) Seed users with a comma-separated list of `email:nickname`

```bash
export SEED_USERS='jane@example.com:Jane,alex@example.com:Alex'
```

6) Start the server

```bash
npm start
```

Open `http://localhost:3000`.

## Config

Edit `config/app.yml` for `expiry_warning_minutes` and `auto_refresh_minutes`.
Edit `config/services.yml` to define services with owners and the environments they are deployed to.

## Schema

See `config/schema.sql` for the full schema. Tables:
- `users`: pre-created emails + nicknames
- `reservations`: service claims with expiry and release timestamps
