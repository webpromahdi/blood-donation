# AGENTS.md

BloodConnect: blood donation & emergency request platform. React 19 SPA (`client/`) speaking to a PHP 8 + MySQL REST API (`api/`). Auth is PHP sessions + bcrypt; DB access via PDO.

## Layout
- `client/` — React 19 + Vite + Tailwind v4 SPA. The app entrypoint is `client/index.html` -> `src/main.tsx` -> `src/App.tsx` (all routes defined here: `/donor/*`, `/admin/*`, `/hospital/*`, `/seeker/*`).
- `api/` — PHP endpoints, one file per route (e.g. `api/auth/login.php`). No framework.
- `database.sql` — full schema **and** seed data; it is the source of truth for DB (watch out: README says a separate `data.sql` exists, it doesn't).
- `cron/scheduled-notifications.php` — runs appointment reminders; set up via Task Scheduler/cron.

## Commands
Run in `client/` (no root `package.json`):
- `npm run dev` — Vite dev server on :5173; it **proxies** `/api` -> `http://localhost/blood-donation`. Start XAMPP Apache + MySQL first or all requests fail.
- `npm run build` — production bundle to `client/dist`.
- `npx tsc --noEmit` — typecheck (tsconfig has `strict: true`, `allowJs: true`). No test suite and no lint script; `tsc` is the primary verification.
- `npm run format` — `oxfmt`.

## API conventions (follow exactly)
- Every endpoint begins with `require_once __DIR__ . '<depth>/config/cors.php';` — path is `../../config/cors.php` from `api/<x>/<file>.php`, `../config/cors.php` from `api/<x>/file.php`. Then `session_start()`, then `require_once config/database.php` (+ `middleware/auth.php` when protected).
- Guard roles with `requireAuth(['donor'])` and `requireApprovedStatus($_SESSION['user_id'], 'donor')` (`api/middleware/auth.php`). Approved status is mandatory for `donor`+`hospital` (admin/seeker skip it).
- All input is JSON (`php://input`), responses are JSON `{success: bool, message, ...}`, and SQL must use PDO prepared statements. Never `echo` HTML before headers.
- Endpoint naming is inconsistent; new paths (e.g. `api/donor/accept-request.php`, `api/donor/available-requests.php`, `api/admin/requests/update-status.php`) are being added as flat `action.php` files alongside older nested ones (`api/donor/requests/accept.php`). Match the newest adjacent files, not the README's endpoint table (stale).

## Client conventions
- Never call `fetch` directly for API; use `api.get/post/put/delete` from `src/utils/apiService.ts` (adds `credentials: 'include'` + JSON headers — the PHP session cookie depends on this).
- API base is `VITE_API_BASE` from `client/.env.development`/`.env.production` (`<base>/api`). `@/*` path alias = `src/*`.
- Codebase mixes `.tsx` and `.jsx` — leave a file's existing extension; don't convert.

## DB & env gotchas
- Dev DB: MySQL `blood_donation`, user `root`, no password (XAMPP defaults in `api/config/database.php`). Re-import `database.sql` to reset (it only seeds the system admin: `admin@bloodconnect.com` / `admin123`).
- The seeded tester accounts in the README table no longer exist — create users via the UI before testing non-admin roles.
- CORS allowlist (`api/config/cors.php`) only lists localhost:5173/localhost:3000/127.0.0.1:5173 and the production URL. Requests from any other dev origin will fail; add the origin there.
- API base in dev must be reachable at `http://localhost/blood-donation` — the repo is meant to live under `C:\xampp\htdocs\blood-donation`.

## Outdated README
README.md describes a removed vanilla-JS frontend (HTML/Tailwind/Zod — the tech-stack, install, and endpoint tables are all stale). The app has migrated to the React client (commit `d55ba76`, DB-driven since `a9e8782`). Trust the code, not the README.

## Don't touch
- `client/src/imports/` — scratch/pasted files, do not add to it.
- `client/dist/`, `node_modules/`, `.env` — gitignored artifacts.
- Schema changes must be reflected in `database.sql` (regenerating is preferred over new migration files, repo has no migration system).