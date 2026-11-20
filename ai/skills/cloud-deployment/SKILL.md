---
name: cloud-deployment
description: Instructions for building, verifying, and deploying StockSmart to Render (backend) and GitHub Pages (frontend). Use when updating CI/CD pipelines, configuring environment variables, or resolving deployment issues.
---

# StockSmart Cloud Deployment Skill

## Target Infrastructure

| Layer | Service |
|---|---|
| **Database** | Supabase PostgreSQL 15+ (Transaction Pooler) |
| **Backend** | Render Python Web Service (Gunicorn + WhiteNoise) |
| **Frontend** | GitHub Pages (React Vite + GitHub Actions) |

---

## Render Deployment Workflow

### Configuration Files
- `render.yaml`: Blueprint definition at repository root.
- `backend/build.sh`: Shell script executed on Render build.
- `backend/stocksmart/settings.py`: WhiteNoise middleware, static asset compression, `dj-database-url`.

### Build & Start Commands
- **Root Directory**: `backend`
- **Build Command**: `./build.sh` (installs deps, runs `collectstatic`, runs `migrate`)
- **Start Command**: `gunicorn stocksmart.wsgi:application --bind 0.0.0.0:$PORT`

### Required Environment Variables on Render

| Variable | Value / Description |
|---|---|
| `DATABASE_URL` | Private Supabase PostgreSQL pooler URI; configure it in the deployment environment. |
| `DJANGO_DEBUG` | `False` |
| `DJANGO_SECRET_KEY` | Strong random secret (generate with `python -c "import secrets; print(secrets.token_hex(50))"`) |
| `DJANGO_ALLOWED_HOSTS` | `*` or your Render domain (e.g. `stocksmart-backend.onrender.com`) |
| `CORS_ALLOWED_ORIGINS` | Your GitHub Pages URL (e.g. `https://username.github.io`) |
| `PYTHON_VERSION` | `3.13.0` |

> ⚠️ `DATABASE_URL` is **mandatory** — the app raises `RuntimeError` on startup without it.

---

## GitHub Pages Deployment Workflow

### Configuration Files
- `frontend/vite.config.js`: Sets `base: './'` for relative asset URLs.
- `frontend/src/App.jsx`: Uses `HashRouter` to prevent 404s on refresh.
- `.github/workflows/deploy.yml`: GitHub Actions pipeline for automated deployment.

### Steps to Deploy
1. In the GitHub repository settings → **Settings → Secrets and variables → Actions**.
2. Add a repository secret `VITE_API_BASE_URL` with your Render backend URL (e.g., `https://stocksmart-backend.onrender.com/api`).
3. Under **Settings → Pages**, set **Source** to **GitHub Actions**.
4. Push code to `main` or `develop`. The workflow compiles the React app and deploys to `https://<username>.github.io/<repo>/`.

---

## Local Pre-Deployment Verification Checklist

```powershell
# 1. Backend health check
backend\venv\Scripts\python backend\manage.py check --database default

# 2. Run full test suite
backend\venv\Scripts\pytest backend\tests\

# 3. Frontend production build
npm --prefix frontend run build

# 4. Collect static files (simulates Render build)
backend\venv\Scripts\python backend\manage.py collectstatic --no-input
```

All 4 steps should complete without errors before pushing to production.

---

## Supabase Dashboard Reference

- **Project**: `shygmtgnkrzkmcavtrjh`
- **Region**: `ap-southeast-1` (Singapore)
- **Dashboard**: [https://supabase.com/dashboard/project/shygmtgnkrzkmcavtrjh](https://supabase.com/dashboard/project/shygmtgnkrzkmcavtrjh)
- **SQL Editor**: Use for running `database/schema.sql` or `database/seed_data.sql` directly.
- **Table Editor**: Use for quick inspection of seeded data.
