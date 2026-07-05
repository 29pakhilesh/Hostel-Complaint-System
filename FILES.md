# Project Files Manifest

## Root

- `README.md`, `QUICKSTART.md`, `FILES.md`
- `Makefile`, `render.yaml`

## Backend (`backend/`)

- `app/server.js` — Express entry point
- `app/config/database.js` — PostgreSQL pool
- `app/middleware/auth.js` — JWT auth
- `app/routers/` — thin HTTP handlers
- `app/services/` — business logic (auth, spam, tracking)
- `app/repositories/` — database queries
- `app/adapters/` — file storage, Google Translate
- `app/migrations/` — migrate.js through migrate-v10.js
- `app/scripts/create-user.js`
- `uploads/` — runtime complaint images

## Frontend (`frontend/src/`)

- `app/` — App.jsx, router.jsx
- `features/` — complaints, auth, admin, department pages
- `shared/api/` — client.js, media.js
- `shared/components/`, `shared/contexts/`, `shared/utils/`
- `main.jsx`, `index.css`
