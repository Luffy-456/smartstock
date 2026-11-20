-- ============================================================================
-- StockSmart: Retail Inventory Management System
-- Schema Definition (3NF Normalized PostgreSQL / Supabase DDL)
-- Target Database: Supabase PostgreSQL 15+ / standard PostgreSQL 14+
-- ============================================================================

-- Drop tables in reverse order of dependencies if recreating
DROP TABLE IF EXISTS purchase_order_items CASCADE;
DROP TABLE IF EXISTS purchase_orders CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS stock_adjustments CASCADE;
DROP TABLE IF EXISTS stock_transfer_items CASCADE;
DROP TABLE IF EXISTS stock_transfers CASCADE;
DROP TABLE IF EXISTS inventory_items CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- ----------------------------------------------------------------------------
-- 1. ROLES TABLE (User Management & Access Control)
-- ----------------------------------------------------------------------------
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_roles_name ON roles(name);

-- ----------------------------------------------------------------------------
-- 2. USERS TABLE (User Management & Access Control)
-- ----------------------------------------------------------------------------
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(150) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role_id INT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
);

CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- ----------------------------------------------------------------------------
-- 3. CATEGORIES TABLE (Product Catalog Management)
-- ----------------------------------------------------------------------------
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    parent_category_id INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_categories_parent FOREIGN KEY (parent_category_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE INDEX idx_categories_code ON categories(code);
CREATE INDEX idx_categories_parent_id ON categories(parent_category_id);

-- ----------------------------------------------------------------------------
-- 4. SUPPLIERS TABLE (Supplier Management)
-- ----------------------------------------------------------------------------
CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    gstin VARCHAR(20),
    lead_time_days INT NOT NULL DEFAULT 7,
    rating NUMERIC(3, 2) NOT NULL DEFAULT 4.00,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_suppliers_name ON suppliers(name);
CREATE INDEX idx_suppliers_city ON suppliers(city);
CREATE INDEX idx_suppliers_rating ON suppliers(rating);

-- ----------------------------------------------------------------------------
-- 5. PRODUCTS TABLE (Product Catalog Management)
-- ----------------------------------------------------------------------------
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category_id INT NOT NULL,
    supplier_id INT,
    description TEXT,
    unit_of_measure VARCHAR(30) NOT NULL DEFAULT 'piece',
    cost_price NUMERIC(12, 2) NOT NULL,
    selling_price NUMERIC(12, 2) NOT NULL,
    reorder_point INT NOT NULL DEFAULT 10,
    safety_stock INT NOT NULL DEFAULT 5,
    image_url VARCHAR(500),
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    CONSTRAINT fk_products_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL,
    CONSTRAINT chk_products_prices CHECK (selling_price >= 0 AND cost_price >= 0),
    CONSTRAINT chk_products_status CHECK (status IN ('ACTIVE', 'DISCONTINUED', 'OUT_OF_STOCK'))
);

CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_supplier_id ON products(supplier_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_name ON products(name);

-- ----------------------------------------------------------------------------
-- 6. LOCATIONS TABLE (Inventory Tracking - Warehouses & Retail Stores)
-- ----------------------------------------------------------------------------
CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    location_type VARCHAR(30) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    manager_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_location_type CHECK (location_type IN ('WAREHOUSE', 'STORE'))
);

CREATE INDEX idx_locations_code ON locations(code);
CREATE INDEX idx_locations_type ON locations(location_type);
CREATE INDEX idx_locations_city ON locations(city);

-- ----------------------------------------------------------------------------
-- 7. INVENTORY_ITEMS TABLE (Inventory Tracking - Stock across locations)
-- ----------------------------------------------------------------------------
CREATE TABLE inventory_items (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL,
    location_id INT NOT NULL,
    quantity_on_hand INT NOT NULL DEFAULT 0,
    quantity_reserved INT NOT NULL DEFAULT 0,
    aisle_shelf VARCHAR(50),
    last_stock_take_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_inventory_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT fk_inventory_location FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
    CONSTRAINT uq_product_location UNIQUE (product_id, location_id),
    CONSTRAINT chk_inventory_quantities CHECK (quantity_on_hand >= 0 AND quantity_reserved >= 0)
);

CREATE INDEX idx_inventory_product_id ON inventory_items(product_id);
CREATE INDEX idx_inventory_location_id ON inventory_items(location_id);
CREATE INDEX idx_inventory_qty_on_hand ON inventory_items(quantity_on_hand);

-- ----------------------------------------------------------------------------
-- 8. STOCK_TRANSFERS TABLE (Inventory Tracking - Inter-location transfers)
-- ----------------------------------------------------------------------------
CREATE TABLE stock_transfers (
    id SERIAL PRIMARY KEY,
    transfer_number VARCHAR(50) UNIQUE NOT NULL,
    from_location_id INT NOT NULL,
    to_location_id INT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    initiated_by_user_id INT,
    transfer_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_date TIMESTAMPTZ,
    notes TEXT,
    CONSTRAINT fk_transfers_from FOREIGN KEY (from_location_id) REFERENCES locations(id) ON DELETE RESTRICT,
    CONSTRAINT fk_transfers_to FOREIGN KEY (to_location_id) REFERENCES locations(id) ON DELETE RESTRICT,
    CONSTRAINT fk_transfers_user FOREIGN KEY (initiated_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_transfers_status CHECK (status IN ('PENDING', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED')),
    CONSTRAINT chk_transfers_different_locations CHECK (from_location_id <> to_location_id)
);

CREATE INDEX idx_transfers_from ON stock_transfers(from_location_id);
CREATE INDEX idx_transfers_to ON stock_transfers(to_location_id);
CREATE INDEX idx_transfers_status ON stock_transfers(status);
CREATE INDEX idx_transfers_number ON stock_transfers(transfer_number);

-- ----------------------------------------------------------------------------
-- 9. STOCK_TRANSFER_ITEMS TABLE (Items within a stock transfer)
-- ----------------------------------------------------------------------------
CREATE TABLE stock_transfer_items (
    id SERIAL PRIMARY KEY,
    transfer_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    received_quantity INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_transfer_items_transfer FOREIGN KEY (transfer_id) REFERENCES stock_transfers(id) ON DELETE CASCADE,
    CONSTRAINT fk_transfer_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    CONSTRAINT chk_transfer_qty CHECK (quantity > 0 AND received_quantity >= 0)
);

CREATE INDEX idx_transfer_items_transfer ON stock_transfer_items(transfer_id);
CREATE INDEX idx_transfer_items_product ON stock_transfer_items(product_id);

-- ----------------------------------------------------------------------------
-- 10. STOCK_ADJUSTMENTS TABLE (Audits, damage, returns)
-- ----------------------------------------------------------------------------
CREATE TABLE stock_adjustments (
    id SERIAL PRIMARY KEY,
    adjustment_number VARCHAR(50) UNIQUE NOT NULL,
    location_id INT NOT NULL,
    product_id INT NOT NULL,
    previous_quantity INT NOT NULL,
    adjusted_quantity INT NOT NULL,
    difference INT NOT NULL,
    reason VARCHAR(50) NOT NULL,
    adjusted_by_user_id INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    CONSTRAINT fk_adjustments_location FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE RESTRICT,
    CONSTRAINT fk_adjustments_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    CONSTRAINT fk_adjustments_user FOREIGN KEY (adjusted_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_adjustment_reason CHECK (reason IN ('DAMAGE', 'EXPIRY', 'AUDIT_DISCREPANCY', 'RETURN', 'OTHER'))
);

CREATE INDEX idx_adjustments_location ON stock_adjustments(location_id);
CREATE INDEX idx_adjustments_product ON stock_adjustments(product_id);
CREATE INDEX idx_adjustments_date ON stock_adjustments(created_at);

-- ----------------------------------------------------------------------------
-- 11. CUSTOMERS TABLE (Order Processing)
-- ----------------------------------------------------------------------------
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_city ON customers(city);

-- ----------------------------------------------------------------------------
-- 12. ORDERS TABLE (Sales Order Processing)
-- ----------------------------------------------------------------------------
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INT,
    location_id INT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    payment_status VARCHAR(30) NOT NULL DEFAULT 'PAID',
    payment_method VARCHAR(50) NOT NULL DEFAULT 'UPI',
    order_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    shipped_date TIMESTAMPTZ,
    delivery_date TIMESTAMPTZ,
    notes TEXT,
    CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    CONSTRAINT fk_orders_location FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE RESTRICT,
    CONSTRAINT chk_orders_status CHECK (status IN ('PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
    CONSTRAINT chk_orders_payment_status CHECK (payment_status IN ('PENDING', 'PAID', 'REFUNDED')),
    CONSTRAINT chk_orders_payment_method CHECK (payment_method IN ('UPI', 'CREDIT_CARD', 'DEBIT_CARD', 'CASH', 'NET_BANKING'))
);

CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_location_id ON orders(location_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_date ON orders(order_date);
CREATE INDEX idx_orders_number ON orders(order_number);

-- ----------------------------------------------------------------------------
-- 13. ORDER_ITEMS TABLE (Sales Order line items)
-- ----------------------------------------------------------------------------
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL,
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    CONSTRAINT chk_order_items_qty CHECK (quantity > 0)
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- ----------------------------------------------------------------------------
-- 14. PURCHASE_ORDERS TABLE (Supplier Management)
-- ----------------------------------------------------------------------------
CREATE TABLE purchase_orders (
    id SERIAL PRIMARY KEY,
    po_number VARCHAR(50) UNIQUE NOT NULL,
    supplier_id INT NOT NULL,
    destination_location_id INT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    order_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expected_delivery_date DATE,
    actual_delivery_date TIMESTAMPTZ,
    created_by_user_id INT,
    notes TEXT,
    CONSTRAINT fk_po_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE RESTRICT,
    CONSTRAINT fk_po_destination FOREIGN KEY (destination_location_id) REFERENCES locations(id) ON DELETE RESTRICT,
    CONSTRAINT fk_po_user FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_po_status CHECK (status IN ('DRAFT', 'ORDERED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED'))
);

CREATE INDEX idx_po_supplier_id ON purchase_orders(supplier_id);
CREATE INDEX idx_po_destination ON purchase_orders(destination_location_id);
CREATE INDEX idx_po_status ON purchase_orders(status);
CREATE INDEX idx_po_number ON purchase_orders(po_number);
CREATE INDEX idx_po_order_date ON purchase_orders(order_date);

-- ----------------------------------------------------------------------------
-- 15. PURCHASE_ORDER_ITEMS TABLE (Purchase Order line items)
-- ----------------------------------------------------------------------------
CREATE TABLE purchase_order_items (
    id SERIAL PRIMARY KEY,
    purchase_order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity_ordered INT NOT NULL,
    quantity_received INT NOT NULL DEFAULT 0,
    unit_cost NUMERIC(12, 2) NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL,
    CONSTRAINT fk_po_items_po FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_po_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    CONSTRAINT chk_po_items_qty CHECK (quantity_ordered > 0 AND quantity_received >= 0)
);

CREATE INDEX idx_po_items_po_id ON purchase_order_items(purchase_order_id);
CREATE INDEX idx_po_items_product_id ON purchase_order_items(product_id);
