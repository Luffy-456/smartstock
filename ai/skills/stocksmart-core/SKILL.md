---
name: stocksmart-core
description: Comprehensive development and operational guide for the StockSmart Retail Inventory Management System. Use when running, modifying, debugging, or adding features to the Django backend or React Vite frontend.
---

# StockSmart Core Development Skill

## Overview
StockSmart is an omnichannel retail inventory platform built with:
- **Backend**: Django REST Framework, Python 3.13, Supabase PostgreSQL (via psycopg3)
- **Frontend**: React 18, Vite, Bootstrap 5.3

> ⚠️ **SQLite has been permanently removed.** `backend/.env` with a valid `DATABASE_URL` is required before running any Django command.

---

## Essential Commands

### 1. Launching Locally (Windows)
Ensure `backend/.env` exists first (copy from `.env.example` and fill in Supabase credentials), then:
```cmd
run.bat
```
To cleanly terminate both servers:
```cmd
stop.bat
```

### 2. Backend Operations (PowerShell — from project root `d:\hcl\smartstock`)

**Check DB connection:**
```powershell
backend\venv\Scripts\python backend\manage.py check --database default
```

**Apply Migrations:**
```powershell
backend\venv\Scripts\python backend\manage.py migrate
```

**Make New Migrations (after model changes):**
```powershell
backend\venv\Scripts\python backend\manage.py makemigrations
backend\venv\Scripts\python backend\manage.py migrate
```

**Seed Database:**
```powershell
backend\venv\Scripts\python backend\manage.py seed_data
```

**Run Development Server:**
```powershell
backend\venv\Scripts\python backend\manage.py runserver 127.0.0.1:8000
```

**Execute Pytest Test Suite:**
```powershell
backend\venv\Scripts\pytest backend\tests\
```

**Install new package:**
```powershell
backend\venv\Scripts\pip install <package>
backend\venv\Scripts\pip freeze > backend\requirements.txt
```

### 3. Frontend Operations (from `frontend/`)
```powershell
npm run dev        # Start Vite dev server (port 5173)
npm run build      # Production static bundle
npm run preview    # Preview production build locally
```

---

## Critical Architecture Invariants

| Rule | Why |
|---|---|
| Use `backend/venv` only | Isolation, reproducibility |
| `backend/.env` with `DATABASE_URL` required | No SQLite fallback — RuntimeError if missing |
| Keep `HashRouter` in App.jsx | GitHub Pages 404 prevention on refresh |
| Business logic → `services.py` | Transaction atomicity via `@transaction.atomic` |
| No barcode/RFID modules | Explicit user directive, permanently excluded |
| Use `import api from '../api/client'` in React | Preserves JWT Bearer token interceptor |

---

## Seeded Demo Accounts

The local seed command creates demo accounts with the private `STOCKSMART_SEED_PASSWORD` environment variable.

| Username | Role |
|---|---|
| `demo_admin` | Admin (full access) |
| `demo_wh_manager` | Warehouse Manager |
| `demo_store_associate` | Store Associate |
| `demo_auditor` | Inventory Auditor |
