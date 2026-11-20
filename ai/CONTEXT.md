# StockSmart: Project Context & Knowledge Base

> Last Updated: 2026-11-20 | Database: **Supabase PostgreSQL (LIVE — SQLite removed)**

---

## 1. Project Identification

- **Project Code**: P04
- **Project Title**: StockSmart: Optimizing Stock Levels for Retailers
- **Industry Domain**: Omnichannel Retail Inventory & Supply Chain Management
- **Primary Objective**: Maintain optimal stock levels, avoid stockouts, streamline order fulfillment, enhance supplier collaboration, and compute actionable inventory KPIs.
- **Current Release**: `v1.0.0` (all 4 sprints completed)

---

## 2. Core Decisions & Tech Stack

| Component | Selected Technology | Specific Configuration / Notes |
|---|---|---|
| **Programming Language** | Python 3.13.13 | All execution strictly within `backend/venv`. |
| **Backend Framework** | Django 5.x + Django REST Framework | RESTful JSON APIs with JWT authentication (`djangorestframework-simplejwt`). |
| **Database** | **Supabase PostgreSQL 15+ (LIVE)** | SQLite **fully removed**. `DATABASE_URL` is mandatory. Connected via `psycopg[binary]` (psycopg3) & `dj-database-url`. Raises `RuntimeError` at startup if `DATABASE_URL` missing. |
| **Frontend Framework** | React 18 (Vite Bundler) | Styled using **Bootstrap 5.3**, Bootstrap Icons & Lucide-React. |
| **Routing** | `HashRouter` (`react-router-dom`) | Eliminates 404 rewrite issues on static hosts like GitHub Pages. |
| **Charts & Visualizations** | Chart.js & `react-chartjs-2` | Sales trends, category valuations, and facility breakdown. |
| **Backend Hosting** | **Render** | Pre-configured with `render.yaml`, `backend/build.sh`, WhiteNoise static file serving, and Gunicorn WSGI. |
| **Frontend Hosting** | **GitHub Pages** | Built with `base: './'` in `vite.config.js` and automated with `.github/workflows/deploy.yml`. |
| **Excluded Features** | Barcode & RFID scanning | **Completely removed** per user directive — do NOT reintroduce. |
| **Local Launcher** | `run.bat` & `stop.bat` | One-click Windows scripts that auto-check venv, run migrations, seed data, and boot both servers. |

---

## 3. Database Configuration (Supabase)

| Field | Value |
|---|---|
| **Host, port, user, and credentials** | Keep in local or deployment environment variables; never commit them. |
| **Connection Type** | Supabase PostgreSQL pooler |
| **Django Driver** | `psycopg` (psycopg3 binary) |
| **Config File** | `backend/.env` → `DATABASE_URL` env var |

> **Important**: `backend/.env` is git-ignored. Supply a private `DATABASE_URL` when setting up a clone; use `.env.example` as a template.

---

## 4. Directory Layout & Key Files

```
smartstock/
├── backend/
│   ├── .env                       # ⚠️ Git-ignored — Supabase DATABASE_URL lives here
│   ├── venv/                      # Dedicated Python 3.13 Virtual Environment
│   ├── stocksmart/                # Django core project
│   │   ├── settings.py            # Supabase DB config (SQLite REMOVED — raises RuntimeError if no DATABASE_URL)
│   │   ├── urls.py                # Root router & /api/health/ endpoint
│   │   ├── services.py            # Atomic business logic (fulfillment, transfers, PO receiving, KPIs)
│   │   └── wsgi.py / asgi.py      # WSGI/ASGI application hooks
│   ├── users/                     # Role-based user model, custom JWT serializer, register API
│   │   └── management/commands/seed_data.py  # Custom ORM seed command
│   ├── products/                  # Category tree, Catalog products, low-stock thresholding
│   ├── inventory/                 # Warehouses/stores, multi-location stock, transfers, adjustments
│   ├── orders/                    # Customer sales orders, dynamic items, auto-stock deduction
│   ├── suppliers/                 # Vendor profiles, Purchase Orders, one-click receipt replenishment
│   ├── analytics/                 # KPIs, inventory turnover, revenue trends, optimal reorder recommendations
│   ├── tests/                     # Pytest suite (tests/test_api_and_services.py)
│   ├── staticfiles/               # WhiteNoise static cache
│   ├── build.sh                   # Render deployment build script
│   ├── pytest.ini                 # Pytest configuration
│   └── requirements.txt           # Python package requirements
├── frontend/
│   ├── src/
│   │   ├── api/client.js          # Axios client with JWT auto-bearer injection
│   │   ├── context/AuthContext.jsx # Global auth state & 1-click demo logins
│   │   ├── components/            # Navbar, Footer, StatCard, Badge
│   │   ├── pages/
│   │   │   ├── Login.jsx          # Login screen with 1-click role logins
│   │   │   ├── Dashboard.jsx      # Top KPIs, sales bar chart, category doughnut, alerts
│   │   │   ├── Products.jsx       # Catalog management, SKU CRUD, multi-location stock modal
│   │   │   ├── Inventory.jsx      # Stock matrix, transfers, physical adjustments, locations
│   │   │   ├── Orders.jsx         # Sales orders, status progression (Pending→Processing→Shipped)
│   │   │   ├── Suppliers.jsx      # Vendor directory & Purchase Orders with "Receive Stock" action
│   │   │   ├── Analytics.jsx      # Strategic KPIs, reorder recommendations, CSV report export
│   │   │   └── Users.jsx          # User accounts & role assignment (Admin only)
│   │   ├── App.jsx                # HashRouter routing & protected layout
│   │   └── main.jsx               # Bootstrap & root mounting
│   ├── package.json               # Node dependencies
│   └── vite.config.js             # Base './' for GitHub Pages compatibility
├── database/
│   ├── schema.sql                 # Supabase PostgreSQL DDL (3NF normalized, 15 tables)
│   ├── seed_data.sql              # Indian context SQL seed script (INR, GSTIN, cities, 2024-2026)
│   ├── ER_DIAGRAM.md              # Mermaid diagram & relationship documentation
│   └── csv/                       # Seed data as CSV files
├── ai/
│   ├── CONTEXT.md                 # This file — full project context & state
│   ├── AGENT_INSTRUCTIONS.md      # Rules for AI agents & developers
│   ├── SPRINT_ROADMAP.md          # Sprint history & backlog
│   └── skills/
│       ├── stocksmart-core/SKILL.md   # Core dev & run commands
│       ├── database-ops/SKILL.md      # DB migration, seeding, schema sync
│       └── cloud-deployment/SKILL.md  # Render + GitHub Pages deployment guide
├── docs/
│   ├── requirements.md            # Software Requirements Specification (SRS)
│   ├── wireframes.md              # Wireframe layouts
│   ├── api_docs.md                # REST API endpoint reference
│   ├── test_report.md             # Test results (7/7 passed)
│   └── deployment_guide.md        # Supabase, Render, and GitHub Pages guides
├── .github/workflows/deploy.yml   # GitHub Actions CI/CD for GitHub Pages
├── render.yaml                    # Render Web Service blueprint
├── run.bat                        # Windows 1-click startup script
├── stop.bat                       # Windows 1-click shutdown script
├── .env.example                   # Environment configuration template
├── .gitignore                     # Git ignore rules (includes .env, db.sqlite3)
└── README.md                      # Comprehensive repository README
```

---

## 5. Database Schema & Tables

The schema uses **15 normalized tables** designed in 3NF, all applied to Supabase:

1. `roles`: Role definitions (`Admin`, `Warehouse Manager`, `Store Associate`, `Inventory Auditor`).
2. `users`: System users with hashed passwords, roles, and contact info.
3. `categories`: Product categories with optional recursive `parent_category_id`.
4. `suppliers`: Vendor profiles with contact details, GSTIN, lead time, and ratings.
5. `products`: Catalog items with SKU, pricing (cost & selling in INR), reorder points, safety stock.
6. `locations`: Facilities (`WAREHOUSE` or `STORE`) with contact info and facility managers.
7. `inventory_items`: Granular stock quantity on-hand and reserved per product per facility.
8. `stock_transfers`: Inter-facility transfers (`PENDING`, `IN_TRANSIT`, `COMPLETED`, `CANCELLED`).
9. `stock_transfer_items`: Line items moving inside a transfer.
10. `stock_adjustments`: Physical audit corrections (Damage, Expiry, Shrinkage, Returns).
11. `customers`: Retail customer profiles with phone numbers and shipping addresses.
12. `orders`: Customer sales orders with payment method, status, and fulfillment facility.
13. `order_items`: Line items inside a sales order.
14. `purchase_orders`: Supplier replenishment orders (`DRAFT`, `ORDERED`, `RECEIVED`, `CANCELLED`).
15. `purchase_order_items`: Line items inside a purchase order.

---

## 6. Atomic Business Logic (`backend/stocksmart/services.py`)

- **Order Fulfillment Stock Deduction**: When an order transitions from `PENDING` to `PROCESSING`, `SHIPPED`, or `DELIVERED`, the system atomically deducts quantities from the designated fulfillment facility's `inventory_items`.
- **Order Cancellation Restocking**: If an active order is marked `CANCELLED`, previously deducted quantities are returned to inventory.
- **PO Receiving Inventory Replenishment**: `POST /api/purchase-orders/:id/receive_po/` marks the PO as `RECEIVED`, timestamps `actual_delivery_date`, and immediately adds quantities to the destination warehouse.
- **Inter-Facility Stock Transfers**: `POST /api/transfers/:id/complete/` atomically decrements items from the source facility and increments them at the destination facility.
- **Stock Audit Adjustments**: Logging physical count discrepancies computes the delta, creates an audit adjustment record, and overrides `quantity_on_hand`.
- **KPI Engine**: Computes Total Valuation (sum of on-hand × cost price), COGS, Inventory Turnover Ratio (COGS / Valuation), and identifies items requiring replenishment.

---

## 7. Seeded Demo Accounts

The local seed command creates these accounts with the private `STOCKSMART_SEED_PASSWORD` value:

| Username | Role | Access Level |
|---|---|---|
| `demo_admin` | Admin | Full system access |
| `demo_wh_manager` | Warehouse Manager | Inventory, transfers, POs |
| `demo_store_associate` | Store Associate | View stock, create orders |
| `demo_auditor` | Inventory Auditor | Read-only audit access |

---

## 8. Environment Setup Checklist (Fresh Clone)

```
1. Copy `.env.example` to `.env`; set `DATABASE_URL` and a unique `DJANGO_SECRET_KEY`
2. cd backend && python -m venv venv
3. venv\Scripts\pip install -r requirements.txt
4. venv\Scripts\python manage.py migrate
5. Set a unique local `STOCKSMART_SEED_PASSWORD`, then run `venv\Scripts\python manage.py seed_data`
6. cd ../frontend && npm install
7. Run run.bat (or manually start both servers)
```

> **Note**: There is no SQLite fallback. Configure both `DATABASE_URL` and `DJANGO_SECRET_KEY` before starting Django.
