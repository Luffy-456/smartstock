# StockSmart: UI Wireframes & Layout Specification

## 1. Visual Layout & Color Palette
- **Primary Color**: `#2563eb` (Modern Royal Blue - actionable items, buttons, active nav)
- **Success Color**: `#10b981` (Emerald Green - received stock, delivered orders, positive turnover)
- **Warning Color**: `#f59e0b` (Amber - pending transfers, low stock warnings)
- **Danger Color**: `#ef4444` (Crimson - out of stock, cancelled orders, deficits)
- **Background**: `#f8fafc` (Cool gray neutral backdrop)
- **Card Surface**: `#ffffff` with subtle border `#e2e8f0` and soft elevation

---

## 2. Screen Wireframes

### Screen 1: Executive Operations Dashboard (`/#/`)
```
+-----------------------------------------------------------------------------------------------+
| [Boxes] StockSmart    Dashboard   Catalog   Inventory   Orders   Suppliers   Analytics   [User v] |
+-----------------------------------------------------------------------------------------------+
| Retail Operations Dashboard                                                    [Refresh Data] |
| Real-time inventory levels, fulfillment metrics, and multi-location performance               |
|                                                                                               |
| +-----------------+  +-----------------+  +-----------------+  +----------------------------+ |
| | Stock Valuation |  | Turnover Ratio  |  | Low Stock Alerts|  | Total Sales Revenue        | |
| | ₹ 24,50,000     |  | 3.4x            |  | 4 Items         |  | ₹ 1,45,800                 | |
| | 16 Active SKUs  |  | COGS: ₹ 8.2L    |  | 1 Out-of-Stock  |  | 25 Sales Orders            | |
| +-----------------+  +-----------------+  +-----------------+  +----------------------------+ |
|                                                                                               |
| +-----------------------------------------------+  +----------------------------------------+ |
| | Monthly Sales Revenue Trend (Bar Chart)       |  | Category Stock Valuation (Doughnut)    | |
| | [Jan] [Feb] [Mar] [Apr] [May] [Jun]           |  | - Electronics: 45%                     | |
| | ₹20k  ₹45k  ₹80k  ₹110k ₹145k                 |  | - Fashion: 25% | - Groceries: 15%      | |
| +-----------------------------------------------+  +----------------------------------------+ |
|                                                                                               |
| +-----------------------------------------------+  +----------------------------------------+ |
| | Low Stock & Reorder Alerts                    |  | Recent Customer Orders                 | |
| |boAt Earbuds    | Stock: 28  | Reorder: 25 |PO |  | ORD-2024-001 | Aarav | ₹5,148 | DELIVERED| |
| |Havells Dry Iron| Stock: 14  | Reorder: 15 |PO |  | ORD-2024-002 | Ishan | ₹13,494| DELIVERED| |
| +-----------------------------------------------+  +----------------------------------------+ |
+-----------------------------------------------------------------------------------------------+
```

### Screen 2: Product Catalog (`/#/products`)
```
+-----------------------------------------------------------------------------------------------+
| Product Catalog Management                                                 [+ Add New Product]|
|                                                                                               |
| [Search SKU/Name...   ]  [All Categories v]  [x] Show Low Stock Only       Showing 16 items   |
|                                                                                               |
| Product Info             Category      Supplier        Cost (₹)  Selling(₹) Total Stock Status|
| boAt Airdopes 450        Smartphones   boAt Lifestyle  ₹1,199    ₹1,999     870 piece   ACTIVE|
| Raymond Cotton Shirt     Men Fashion   Raymond Mills   ₹1,250    ₹2,499     625 piece   ACTIVE|
| Tata Tea Gold 1kg        Groceries     Tata Consumer   ₹420      ₹560       1500 kg     ACTIVE|
| Milton Flask 1000ml      Home/Kitchen  Milton House    ₹680      ₹1,099     32 piece    [Low] |
+-----------------------------------------------------------------------------------------------+
```

### Screen 3: Multi-Location Inventory & Stock Transfers (`/#/inventory`)
```
+-----------------------------------------------------------------------------------------------+
| Multi-Location Inventory & Stock Transfers             [Stock Adjustment]  [Transfer Stock]   |
|                                                                                               |
| [All Stock Levels]  [Stock Transfers]  [Audit Adjustments]  [Facilities & Locations]          |
|                                                                                               |
| Product                  Facility / Location     Type        Aisle/Shelf  On-Hand  Available  |
| boAt Airdopes 450        Central Hub Bhiwandi    WAREHOUSE   Aisle-A1-S01  350      335 units  |
| boAt Airdopes 450        North Mega Gurugram     WAREHOUSE   Aisle-G1-01   420      390 units  |
| boAt Airdopes 450        Flagship Store Bandra   STORE       Shelf-E01     28       26 units   |
| Raymond Cotton Shirt     Central Hub Bhiwandi    WAREHOUSE   Aisle-B2-S01  240      220 units  |
+-----------------------------------------------------------------------------------------------+
```

### Screen 4: Customer Sales Orders (`/#/orders`)
```
+-----------------------------------------------------------------------------------------------+
| Customer Sales Orders & Fulfillment                                       [+ New Sales Order] |
|                                                                                               |
| [Search Order #/Name...]  [All Statuses v]                                Showing 25 orders   |
|                                                                                               |
| Order #       Customer         Fulfillment Facility  Payment     Total (INR) Status    Actions|
| ORD-2024-001  Demo Customer 01 Demo Store 01         UPI / PAID  ₹5,148      DELIVERED [View] |
| ORD-2024-018  Demo Customer 05 Demo Store 03         CARD / PAID ₹5,994      SHIPPED   [Deliver]
| ORD-2024-021  Demo Customer 08 Demo Store 01         UPI / PAID  ₹1,999      PROCESSING[Pack] |
| ORD-2024-023  Demo Customer 10 Demo Store 05         UPI / PEND  ₹2,198      PENDING   [Process]
+-----------------------------------------------------------------------------------------------+
```

### Screen 5: Supplier PO Management (`/#/suppliers`)
```
+-----------------------------------------------------------------------------------------------+
| Supplier Management & Purchase Orders                    [Add Supplier]  [Create PO]          |
|                                                                                               |
| [Purchase Orders]  [Suppliers Directory]                                                      |
|                                                                                               |
| PO Number   Supplier                 Destination Warehouse  Total Cost  Status     Actions    |
| PO-2024-001 boAt Lifestyle           Central Hub Bhiwandi   ₹2,39,800   RECEIVED   [View]     |
| PO-2024-010 boAt Lifestyle           North Mega Gurugram    ₹2,39,800   ORDERED    [Receive]  |
| PO-2024-011 Tata Consumer Products   South Logistics BLR    ₹87,000     ORDERED    [Receive]  |
| PO-2024-012 FabIndia Overseas        Central Hub Bhiwandi   ₹1,80,000   DRAFT      [Submit]   |
+-----------------------------------------------------------------------------------------------+
```

### Screen 6: Strategic Analytics & Reorder Planning (`/#/analytics`)
```
+-----------------------------------------------------------------------------------------------+
| Reporting, KPIs & Inventory Analytics                         [Export Reorder CSV Report]     |
|                                                                                               |
| +-------------------------------------------------------------------------------------------+ |
| | Optimal Reorder & Replenishment Plan                                                      | |
| | Product               Category      Supplier       Stock  Reorder  Rec. PO Qty  Urgency   | |
| | boAt Stone 650        Electronics   boAt Lifestyle 18     20       24 units     MEDIUM    | |
| | Prestige Cooker 5L    Home/Kitchen  Prestige Appl. 8      15       22 units     HIGH      | |
| | Raw Carded Cotton     Fashion       Artisans Coop  0      5        20 kg        CRITICAL  | |
| +-------------------------------------------------------------------------------------------+ |
+-----------------------------------------------------------------------------------------------+
```
