# StockSmart: REST API Documentation

Base URL (Local): `http://127.0.0.1:8000/api`  
Base URL (Render Production): `https://stocksmart-backend.onrender.com/api`

---

## 1. Authentication & Users

### 1.1 Obtain JWT Tokens (Login)
- **Endpoint**: `POST /api/auth/login/`
- **Access**: Public
- **Request Body**:
```json
{
  "username": "demo_admin",
  "password": "your-password"
}
```
- **Response (200 OK)**:
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsIn...",
  "refresh": "eyJhbGciOiJIUzI1NiIsIn...",
  "user": {
    "id": 1,
    "username": "demo_admin",
    "email": "admin@example.com",
    "first_name": "Demo",
    "last_name": "Admin",
    "role": "Admin",
    "is_superuser": true
  }
}
```

### 1.2 Current User Profile
- **Endpoint**: `GET /api/users/me/`
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**: User profile details with role permissions.

### 1.3 Register New User
- **Endpoint**: `POST /api/users/register/`
- **Request Body**:
```json
{
  "username": "demo_manager",
  "email": "manager@example.com",
  "password": "your-password",
  "first_name": "Demo",
  "last_name": "Manager",
  "phone": "+91 00000 00000",
  "role": 2
}
```

---

## 2. Product Catalog Management

### 2.1 List Products
- **Endpoint**: `GET /api/products/`
- **Query Params**:
  - `search` (string): Search SKU, Name, Description
  - `category` (int): Category ID filter
  - `status` (string): `ACTIVE`, `DISCONTINUED`, `OUT_OF_STOCK`
  - `low_stock` (bool): `true` to return products at or below reorder threshold
- **Response (200 OK)**: Paginated product list.

### 2.2 Create Product
- **Endpoint**: `POST /api/products/`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
```json
{
  "sku": "SKU-ELEC-BOAT-A450",
  "name": "boAt Airdopes 450 TWS Wireless Earbuds",
  "category": 2,
  "supplier": 4,
  "description": "Bluetooth 5.2 earbuds with 42h playback",
  "unit_of_measure": "piece",
  "cost_price": 1199.00,
  "selling_price": 1999.00,
  "reorder_point": 25,
  "safety_stock": 10,
  "image_url": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df",
  "status": "ACTIVE"
}
```

### 2.3 Product Detail & Multi-Location Stock
- **Endpoint**: `GET /api/products/:id/`
- **Response (200 OK)**: Product attributes along with an `inventory_items` array detailing stock on-hand, reserved, and available per warehouse/store.

### 2.4 Low Stock Alerts
- **Endpoint**: `GET /api/products/low_stock_alerts/`
- **Response (200 OK)**: Array of critical items below reorder point with calculated stock deficits.

---

## 3. Inventory & Inter-Facility Transfers

### 3.1 All Stock Items
- **Endpoint**: `GET /api/inventory-items/`
- **Query Params**: `location`, `product`, `search`
- **Response (200 OK)**: Granular inventory records across all facilities.

### 3.2 Facilities / Locations
- **Endpoint**: `GET /api/locations/`
- **Response (200 OK)**: List of warehouses and retail stores with contact info, manager, and aggregated total stock.

### 3.3 Create Inter-Location Stock Transfer
- **Endpoint**: `POST /api/transfers/`
- **Request Body**:
```json
{
  "transfer_number": "TRF-2024-101",
  "from_location": 1,
  "to_location": 5,
  "notes": "Emergency replenishment from Bhiwandi WH to Bandra Retail",
  "items": [
    {
      "product": 1,
      "quantity": 25
    }
  ]
}
```

### 3.4 Complete Stock Transfer
- **Endpoint**: `POST /api/transfers/:id/complete/`
- **Action**: Atomically deducts transferred items from the source facility and credits them to the destination facility.

### 3.5 Record Stock Adjustment
- **Endpoint**: `POST /api/adjustments/`
- **Request Body**:
```json
{
  "location": 1,
  "product": 1,
  "adjusted_quantity": 348,
  "reason": "DAMAGE",
  "notes": "2 units damaged in forklift movement"
}
```

---

## 4. Order Processing & Fulfillment

### 4.1 Create Sales Order
- **Endpoint**: `POST /api/orders/`
- **Request Body**:
```json
{
  "order_number": "ORD-2024-999",
  "customer": 1,
  "location": 5,
  "payment_method": "UPI",
  "payment_status": "PAID",
  "notes": "Store in-person collection",
  "items": [
    {
      "product": 1,
      "quantity": 2,
      "unit_price": 1999.00
    }
  ]
}
```

### 4.2 Update Order Fulfillment Status
- **Endpoint**: `POST /api/orders/:id/update_status/`
- **Request Body**:
```json
{
  "status": "PROCESSING"
}
```
*(Automatically deducts stock from designated location when transitioning from PENDING to PROCESSING/SHIPPED)*.

---

## 5. Supplier Management & POs

### 5.1 Create Purchase Order
- **Endpoint**: `POST /api/purchase-orders/`
- **Request Body**:
```json
{
  "po_number": "PO-2024-501",
  "supplier": 4,
  "destination_location": 1,
  "expected_delivery_date": "2024-06-01",
  "notes": "Quarterly restock",
  "items": [
    {
      "product": 1,
      "quantity_ordered": 200,
      "unit_cost": 1199.00
    }
  ]
}
```

### 5.2 Receive Purchase Order
- **Endpoint**: `POST /api/purchase-orders/:id/receive_po/`
- **Action**: Marks PO as `RECEIVED`, sets `actual_delivery_date`, and immediately adds procured units into destination warehouse stock.

---

## 6. Strategic Analytics & Reporting

| Endpoint | Method | Description |
|---|---|---|
| `/api/analytics/kpis/` | `GET` | Dashboard KPIs: Total stock valuation, orders, revenue, turnover ratio, COGS. |
| `/api/analytics/sales-trend/` | `GET` | Monthly sales volume and gross revenue aggregation. |
| `/api/analytics/category-breakdown/` | `GET` | Stock valuation and quantity grouped by catalog category. |
| `/api/analytics/location-breakdown/` | `GET` | Stock valuation and item counts grouped by facility. |
| `/api/analytics/top-products/` | `GET` | Top 5 revenue and volume generating SKUs. |
| `/api/analytics/reorder-recommendations/` | `GET` | Priority replenishment plan with safety stock deficit & optimal PO quantity. |
