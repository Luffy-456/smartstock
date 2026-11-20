# StockSmart: Instructions for Future AI Agents & Developers

Any AI assistant or developer picking up this repository must adhere to the rules and conventions below to maintain architectural consistency and deployment readiness.

> **State as of 2026-11-20**: Supabase is the only supported database. SQLite has been permanently removed.

---

## 1. Environment & Execution Rules

### 1.1 Virtual Environment is Mandatory
- Never install packages or run commands using global Python.
- **Always** execute via `backend/venv`:
  - Windows: `backend\venv\Scripts\python.exe` and `backend\venv\Scripts\pip.exe`
  - Linux/macOS: `backend/venv/bin/python` and `backend/venv/bin/pip`
- Test command: `backend\venv\Scripts\pytest` from project root (or `pytest` with venv activated).

### 1.2 Database is Supabase Only — No SQLite Fallback
- **SQLite has been permanently removed.** `backend/db.sqlite3` no longer exists.
- `settings.py` raises a `RuntimeError` at startup if `DATABASE_URL` is not set.
- The connection config must be in `backend/.env` (git-ignored):
  ```
  DATABASE_URL=postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@[YOUR-POOLER-HOST]:5432/postgres
  ```
- The `.env.example` at the project root documents the full template.
- When running Django management commands directly (not via `run.bat`), ensure `backend/.env` exists first.
- The `psycopg` (psycopg3) driver is used — not `psycopg2`. This is intentional for Python 3.13 compatibility.

### 1.3 Frontend Build & Routing
- The React frontend uses Vite and is configured for **GitHub Pages**.
- **Do NOT switch `HashRouter` to `BrowserRouter`** in `frontend/src/App.jsx`. GitHub Pages lacks dynamic server-side URL rewriting and will serve 404s on page refresh if `BrowserRouter` is used.
- Keep `base: './'` in `frontend/vite.config.js`.

### 1.4 Barcode & RFID Exclusion
- The user explicitly requested removing barcode scanning and RFID integration.
- Do **NOT** reintroduce barcode/RFID scanning libraries, camera integrations, or scanner hardware endpoints.

---

## 2. Common Agent Workflows

### A. Running Tests
Whenever you make changes to backend models, views, or business services:
```powershell
cd d:\hcl\smartstock
backend\venv\Scripts\pytest backend\tests\
```
Ensure all 7 tests in `backend/tests/test_api_and_services.py` pass. If adding new features, write corresponding test cases.

### B. Adding a New API Endpoint
1. Define the model in the appropriate app (`models.py`).
2. Add fields to `serializers.py`.
3. Put business logic in `stocksmart/services.py` rather than views to preserve transaction atomicity.
4. Add ViewSet actions in `views.py` and register in `urls.py`.
5. Run migrations: `backend\venv\Scripts\python backend\manage.py makemigrations && migrate`
6. Update `docs/api_docs.md` and `database/schema.sql`.

### C. Adding a New Frontend Feature
1. Create page or component in `frontend/src/pages/` or `frontend/src/components/`.
2. Use the configured Axios client `import api from '../api/client'` (do NOT instantiate separate Axios instances — this preserves the Bearer JWT token interceptor).
3. Verify production build passes:
```powershell
npm --prefix frontend run build
```

### D. Updating Seed Data
If new tables or attributes are added:
1. Update `backend/users/management/commands/seed_data.py`.
2. Update `database/seed_data.sql`.
3. Update corresponding CSV files in `database/csv/`.
4. Re-run: `backend\venv\Scripts\python backend\manage.py seed_data`

### E. Schema Changes (Migrations)
```powershell
# From project root (Windows)
backend\venv\Scripts\python backend\manage.py makemigrations
backend\venv\Scripts\python backend\manage.py migrate
```
After migrating, **always** mirror the column changes in `database/schema.sql` to keep the Supabase DDL reference synchronized.

### F. Verifying Supabase Connection
```powershell
backend\venv\Scripts\python backend\manage.py check --database default
```
Expect: `System check identified no issues (0 silenced).`

---

## 3. Deployment Checkpoints

### Render (Backend)
- Ensure `backend/build.sh` contains any new build steps.
- Set `DATABASE_URL` as an environment variable on Render (same Supabase URI).
- Set `DJANGO_DEBUG=False` and `DJANGO_SECRET_KEY` to a strong secret in Render env vars.
- `render.yaml` at the repo root defines the service blueprint.

### GitHub Pages (Frontend)
- Verify `.github/workflows/deploy.yml` builds without errors.
- Set `VITE_API_BASE_URL` as a GitHub Actions repository secret pointing to the Render backend URL.

### Local Startup (Windows)
- Ensure `backend/.env` exists with valid `DATABASE_URL` before running `run.bat`.
- `run.bat` runs `migrate` and `seed_data` automatically on each start.

---

## 4. Architecture Invariants (Never Break These)

| Rule | Reason |
|---|---|
| Use `backend/venv` only | Isolation, reproducibility |
| `DATABASE_URL` must be set | No SQLite fallback exists anymore |
| Keep `HashRouter` | GitHub Pages 404 prevention |
| Business logic in `services.py` | Transaction atomicity via `@transaction.atomic` |
| No barcode/RFID modules | Explicit user directive |
| Run `migrate` after model changes | Keeps Supabase schema in sync |
| Mirror model changes in `database/schema.sql` | Keeps DDL reference accurate |
