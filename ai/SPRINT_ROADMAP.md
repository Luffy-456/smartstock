# StockSmart: Sprint Progress & Agile Roadmap

> Last Updated: 2026-11-20

---

## 1. Sprint Execution Summary (Total 90 Hours)

| Sprint | Allocated | Focus | Target Deliverables | Status | Tag |
|---|---|---|---|---|---|
| **Sprint 0** | 6 Hours | Foundation & Skeleton | Git repository, 3NF schema, wireframes, virtualenv, JWT login | ✅ Completed | `v0.1.0` |
| **Sprint 1** | 28 Hours | Catalog & Inventory | Product catalog, multi-facility inventory matrix, stock transfers, adjustments | ✅ Completed | `v0.2.0` |
| **Sprint 2** | 28 Hours | Orders & Suppliers | Omnichannel customer orders, auto-stock deduction, PO procurement & receiving | ✅ Completed | `v0.3.0` |
| **Sprint 3** | 28 Hours | Analytics & Release | KPI dashboard, turnover calculations, Render hosting, GitHub Pages, `run.bat` | ✅ Completed | `v1.0.0` |

---

## 2. Post-Release Changes (After v1.0.0)

| Date | Change | Details |
|---|---|---|
| 2026-11-20 | **SQLite removed, Supabase connected** | `DATABASE_URL` now mandatory. `db.sqlite3` deleted. `settings.py` raises `RuntimeError` if env var is missing. `backend/.env` created with live Supabase pooler credentials. All 22 Django migrations applied and seed data verified on Supabase. |

---

## 3. Definition of Done (DoD) Verification

- [x] Code committed to feature branches and merged to `develop` and `main`.
- [x] All 6 module acceptance criteria met and verified locally.
- [x] Pytest automated test suite passing (7/7 tests).
- [x] Frontend compiled cleanly with Vite production build.
- [x] Database DDL and seed scripts verified in Supabase PostgreSQL syntax.
- [x] Complete documentation written (`requirements.md`, `wireframes.md`, `api_docs.md`, `test_report.md`, `deployment_guide.md`).
- [x] Release tag `v1.0.0` created.
- [x] **Supabase live connection established and verified** (2026-11-20).

---

## 4. Backlog & Future Extension Opportunities

If continuing this project with future sprints, consider the following roadmap items:

1. **Automated Replenishment Cron Jobs**:
   - Automatically trigger purchase order generation when items fall below safety buffer levels.
2. **PDF Invoicing Engine**:
   - Generate downloadable PDF tax invoices (with GSTIN compliance) for delivered customer orders using `xhtml2pdf` or `ReportLab`.
3. **Webhook Notifications**:
   - Trigger Slack or WhatsApp/SMS notifications to warehouse managers when high-value transfers are dispatched or received.
4. **Demand Forecasting ML Model**:
   - Implement exponential smoothing or ARIMA on historical sales data to predict monthly SKU demand.
5. **Supabase Auth Integration**:
   - Optionally replace Django JWT with Supabase Auth for unified auth across web & mobile clients.
6. **Supabase Realtime**:
   - Use Supabase Realtime subscriptions to push live stock level updates to the React frontend without polling.
