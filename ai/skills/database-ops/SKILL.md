---
name: database-ops
description: Guide for database schema management, Supabase PostgreSQL synchronization, Django ORM migrations, realistic Indian test-data generation, and seed data scripts in StockSmart.
---

# StockSmart Database Operations Skill

## Database Architecture

StockSmart uses **Supabase PostgreSQL 15+** exclusively.

> ⚠️ **SQLite has been permanently removed** as of 2026-11-20. `settings.py` raises a `RuntimeError` on startup if `DATABASE_URL` is not set. There is no offline SQLite fallback.

### Configuration
Connection details and credentials belong in the git-ignored `backend/.env` or deployment environment:
```
DATABASE_URL=postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@[YOUR-POOLER-HOST]:5432/postgres
```
See `.env.example` at the project root for the full template.

---

## Schema & Seed Files

All database assets are maintained under `database/`:
- `database/schema.sql`: Complete DDL for Supabase PostgreSQL (15 tables, indexes, checks, foreign keys).
- `database/seed_data.sql`: Indian retail context sample data (names, INR prices, GSTINs, metro cities).
- `database/ER_DIAGRAM.md`: Entity Relationship summary and Mermaid ER diagram.
- `database/csv/`: CSV copies of all master tables for direct spreadsheet imports.

---

## Common Operations

### 1. Verify Connection
```powershell
# From project root
backend\venv\Scripts\python backend\manage.py check --database default
# Expected: "System check identified no issues (0 silenced)."
```

### 2. Apply Migrations to Supabase
```powershell
backend\venv\Scripts\python backend\manage.py migrate
```

### 3. Create New Migrations (after model changes)
```powershell
backend\venv\Scripts\python backend\manage.py makemigrations
backend\venv\Scripts\python backend\manage.py migrate
```
> After migrating, **mirror the column changes in `database/schema.sql`** to keep the Supabase DDL reference synchronized.

### 4. Seeding via Django ORM
```powershell
backend\venv\Scripts\python backend\manage.py seed_data
```
Seed command file: `backend/users/management/commands/seed_data.py`

### 5. Direct Execution in Supabase Dashboard
1. Open [Supabase Dashboard](https://supabase.com/dashboard) → Select project → **SQL Editor**.
2. Run `database/schema.sql` to create/recreate tables.
3. Run `database/seed_data.sql` to populate sample data.

---

## Migration Status (as of 2026-11-20)

All 22 migrations applied to live Supabase:

| App | Migrations Applied |
|---|---|
| `contenttypes` | 0001, 0002 |
| `auth` | 0001–0012 |
| `users` | 0001 |
| `admin` | 0001–0003 |
| `suppliers` | 0001, 0002 |
| `products` | 0001, 0002 |
| `inventory` | 0001, 0002, 0003 |
| `orders` | 0001, 0002 |
| `sessions` | 0001 |
