# StockSmart: System Requirements Specification (SRS)

## 1. Project Identification
- **Project Code**: P04
- **Project Title**: StockSmart: Optimizing Stock Levels for Retailers
- **Industry Vertical**: Omnichannel Retail & Supply Chain Management
- **Technology Stack**: Python 3.13, Django 6.x, Django REST Framework, Supabase PostgreSQL, React 18, Vite, Bootstrap 5

---

## 2. Business Objectives
1. **Inventory Optimization**: Maintain optimal safety stocks to avoid expensive stockouts while eliminating excess capital lockup and shrinkage.
2. **Order Fulfillment Velocity**: Streamline order picking, packing, shipping, and automated physical stock deduction across warehouses and retail outlets.
3. **Resilient Supplier Collaboration**: Track supplier lead times, automate replenishment purchase orders, and record goods receipts directly into inventory.
4. **Data-Driven KPIs**: Provide real-time dashboards for Inventory Turnover Ratio, stock valuations in INR, and replenishment recommendations.
5. **Role-Based Governance**: Enforce strict data security with JWT authentication and segregated operational roles (Admin, Warehouse Manager, Store Associate).

---

## 3. Functional Requirements by Module

### Module 1: Product Catalog Management
- **FR-1.1**: Retailers must be able to create, update, deactivate, and view products with unique SKU, title, description, category, unit of measure, cost price, and selling price.
- **FR-1.2**: Support multi-tier hierarchical product categories.
- **FR-1.3**: Configure reorder threshold levels and safety stock buffers per SKU.
- **FR-1.4**: Real-time aggregation of inventory across all physical facilities linked to each catalog product.

### Module 2: Inventory Tracking & Inter-Facility Transfers
- **FR-2.1**: Track quantity on hand, quantity reserved, and available quantity per product per location (warehouses and retail stores).
- **FR-2.2**: Support location hierarchy (Mega distribution centers, regional fulfillment hubs, flagship stores, high street outlets).
- **FR-2.3**: Allow warehouse managers to initiate and track stock transfers between facilities with statuses: `PENDING`, `IN_TRANSIT`, `COMPLETED`, `CANCELLED`.
- **FR-2.4**: Atomically update physical stock counts upon transfer completion (deducting from source, crediting to destination).
- **FR-2.5**: Record stock adjustments with audit justifications (Damage, Expiry, Cycle count discrepancy, Returns).

### Module 3: Order Processing & Fulfillment
- **FR-3.1**: Capture sales orders with omnichannel customer details, fulfillment facility, payment method (UPI, Card, Cash, Net Banking), and line items.
- **FR-3.2**: Order fulfillment lifecycle tracking: `PENDING` -> `PROCESSING` -> `PACKED` -> `SHIPPED` -> `DELIVERED` -> `CANCELLED`.
- **FR-3.3**: Automatic atomic deduction of stock from the designated fulfillment facility when an order enters processing/shipping.
- **FR-3.4**: Automatic restoration of stock if an active order is cancelled before final delivery.

### Module 4: Supplier Management & Purchase Orders (POs)
- **FR-4.1**: Maintain vendor profiles with contact person, phone, email, address, GSTIN, average lead time in days, and vendor quality rating.
- **FR-4.2**: Generate procurement Purchase Orders with PO number, expected delivery date, supplier, destination warehouse, and unit costs.
- **FR-4.3**: Provide a one-click "Receive Stock" workflow that marks the PO as `RECEIVED` and immediately increments physical warehouse stock.

### Module 5: Reporting, Analytics & Strategic KPIs
- **FR-5.1**: Dashboard KPI summary cards: Total Inventory Valuation (INR), Inventory Turnover Ratio (COGS / Inventory Valuation), Low Stock Alerts count, Total Sales Revenue.
- **FR-5.2**: Visual monthly revenue sales trend line/bar charts.
- **FR-5.3**: Category valuation and product distribution charts.
- **FR-5.4**: Automated reorder recommendations identifying stock deficits and suggesting reorder quantities with urgency flags (`CRITICAL`, `HIGH`, `MEDIUM`).
- **FR-5.5**: Exportable CSV reports for replenishment audits and financial reporting.

### Module 6: User Management and Access Control
- **FR-6.1**: JWT-based secure authentication (`/api/auth/login/`, `/api/auth/refresh/`).
- **FR-6.2**: User directory with roles:
  - **Admin**: Full administrative permissions across catalog, inventory, orders, suppliers, and user provisioning.
  - **Warehouse Manager**: Manage inventory, stock transfers, and purchase order receipts.
  - **Store Associate**: Manage customer sales orders, store-level stock visibility, and stock transfer requests.
  - **Inventory Auditor**: Audit discrepancy reporting and read-only analytics.

---

## 4. Non-Functional Requirements
- **Performance**: API responses under 200ms for master and transaction queries using optimized B-Tree indexes.
- **Data Integrity**: Enforced Foreign Key constraints and atomic database transactions (`@transaction.atomic`) for all stock movements.
- **Security**: Passwords hashed using PBKDF2/argon2; JWT tokens stored in browser local storage and expired systematically.
- **Cloud Compatibility**:
  - Backend designed for Render web service containerization (WhiteNoise static file serving, Gunicorn WSGI server, PORT binding).
  - Frontend compiled to static assets compatible with GitHub Pages hosting (using relative base path and HashRouter navigation).
  - Database powered by Supabase PostgreSQL (SSL mode required in production, connection pooling supported).
