-- ============================================================================
-- StockSmart: Retail Inventory Management System
-- Seed Data Script (Indian Context: INR, Cities, GSTIN, Phone, 2024-2026)
-- Target Database: Supabase PostgreSQL 15+ / standard PostgreSQL
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. ROLES
-- ----------------------------------------------------------------------------
INSERT INTO roles (id, name, description) VALUES
(1, 'Admin', 'Superuser with full administrative access across all modules and settings'),
(2, 'Warehouse Manager', 'Manages warehouse inventory levels, stock transfers, and incoming supplier POs'),
(3, 'Store Associate', 'Retail store staff handling in-store sales orders, stock requests, and adjustments'),
(4, 'Inventory Auditor', 'Read-only analyst role with stock adjustment and audit verification privileges');

-- Set sequence if needed
SELECT setval('roles_id_seq', (SELECT MAX(id) FROM roles));

-- ----------------------------------------------------------------------------
-- 2. USERS (Unusable password placeholders; set credentials through Django)
-- ----------------------------------------------------------------------------
INSERT INTO users (id, username, email, password_hash, first_name, last_name, phone, role_id, is_active, created_at) VALUES
(1, 'demo_admin', 'admin@example.com', '!', 'Demo', 'Admin', '+91 00000 00001', 1, TRUE, '2024-01-10 09:00:00+05:30'),
(2, 'demo_wh_manager', 'warehouse@example.com', '!', 'Demo', 'Warehouse Manager', '+91 00000 00002', 2, TRUE, '2024-01-15 10:30:00+05:30'),
(3, 'demo_store_associate', 'store@example.com', '!', 'Demo', 'Store Associate', '+91 00000 00003', 3, TRUE, '2024-02-01 11:00:00+05:30'),
(4, 'demo_auditor', 'auditor@example.com', '!', 'Demo', 'Auditor', '+91 00000 00004', 4, TRUE, '2024-02-10 14:15:00+05:30'),
(5, 'demo_user_05', 'user05@example.com', '!', 'Demo', 'User 05', '+91 00000 00005', 3, TRUE, '2024-03-01 09:45:00+05:30'),
(6, 'demo_user_06', 'user06@example.com', '!', 'Demo', 'User 06', '+91 00000 00006', 3, TRUE, '2024-03-05 10:00:00+05:30'),
(7, 'demo_user_07', 'user07@example.com', '!', 'Demo', 'User 07', '+91 00000 00007', 3, TRUE, '2024-03-12 11:30:00+05:30'),
(8, 'demo_user_08', 'user08@example.com', '!', 'Demo', 'User 08', '+91 00000 00008', 3, TRUE, '2024-03-20 12:00:00+05:30'),
(9, 'demo_user_09', 'user09@example.com', '!', 'Demo', 'User 09', '+91 00000 00009', 3, TRUE, '2024-04-01 09:15:00+05:30'),
(10, 'demo_user_10', 'user10@example.com', '!', 'Demo', 'User 10', '+91 00000 00010', 4, TRUE, '2024-04-10 16:00:00+05:30'),
(11, 'demo_user_11', 'user11@example.com', '!', 'Demo', 'User 11', '+91 00000 00011', 2, TRUE, '2024-04-15 15:30:00+05:30'),
-- Additional demo user
(12, 'demo_user_12', 'user12@example.com', '!', 'Demo', 'User 12', '+91 00000 00012', 3, TRUE, '2024-05-01 10:00:00+05:30');

SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- ----------------------------------------------------------------------------
-- 3. CATEGORIES
-- ----------------------------------------------------------------------------
INSERT INTO categories (id, name, code, description, parent_category_id) VALUES
(1, 'Electronics & Appliances', 'CAT-ELEC', 'Consumer electronics, accessories, and home appliances', NULL),
(2, 'Smartphones & Tablets', 'CAT-MOB', 'Mobile phones, accessories and tablets', 1),
(3, 'Computing & Laptops', 'CAT-COMP', 'Laptops, monitors, keyboards and peripherals', 1),
(4, 'Fashion & Apparel', 'CAT-FASH', 'Men, women, and kids ethnic and western apparel', NULL),
(5, 'Men Fashion', 'CAT-MEN', 'Shirts, jeans, ethnic kurtas and footwear', 4),
(6, 'Women Fashion', 'CAT-WOMEN', 'Sarees, kurtis, dresses and footwear', 4),
(7, 'Groceries & Staples', 'CAT-GROC', 'Daily essentials, pulses, edible oils, spices', NULL),
(8, 'Home & Kitchen', 'CAT-HOME', 'Cookware, dinnerware, home decor and storage', NULL),
(9, 'Health & Personal Care', 'CAT-HLTH', 'Skincare, haircare, hygiene and wellness', NULL),
(10, 'Sports & Fitness', 'CAT-SPRT', 'Exercise gear, cricket equipment and sportswear', NULL),
(11, 'Stationery & Books', 'CAT-STAT', 'Office supplies, notebook sets, books', NULL),
-- Edge-case 2: Category with maximum length description and minimal code
(12, 'Industrial Hardware & DIY Supplies - Special Heavy Engineering Equipment And Fasteners Line', 'CAT-IND-SPEC', 'Comprehensive collection of heavy-duty industrial components, fasteners, specialized pneumatic actuators, precision tools, safety harnesses, anti-vibration rubber dampers, galvanized fittings, torque wrenches, and warehouse maintenance equipment designed strictly according to ISO 9001 and BIS standards for modern enterprise distribution centers.', NULL);

SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));

-- ----------------------------------------------------------------------------
-- 4. SUPPLIERS
-- ----------------------------------------------------------------------------
INSERT INTO suppliers (id, name, contact_person, email, phone, address, city, state, pincode, gstin, lead_time_days, rating, is_active) VALUES
(1, 'Demo Supplier 01', 'Demo Contact 01', 'supplier01@example.com', '+91 00000 00011', 'Sample business address 01', 'Noida', 'Uttar Pradesh', '000000', NULL, 5, 4.80, TRUE),
(2, 'Demo Supplier 02', 'Demo Contact 02', 'supplier02@example.com', '+91 00000 00012', 'Sample business address 02', 'Mumbai', 'Maharashtra', '000000', NULL, 4, 4.90, TRUE),
(3, 'Demo Supplier 03', 'Demo Contact 03', 'supplier03@example.com', '+91 00000 00013', 'Sample business address 03', 'Thane', 'Maharashtra', '000000', NULL, 7, 4.60, TRUE),
(4, 'Demo Supplier 04', 'Demo Contact 04', 'supplier04@example.com', '+91 00000 00014', 'Sample business address 04', 'New Delhi', 'Delhi', '000000', NULL, 6, 4.75, TRUE),
(5, 'Demo Supplier 05', 'Demo Contact 05', 'supplier05@example.com', '+91 00000 00015', 'Sample business address 05', 'Bengaluru', 'Karnataka', '000000', NULL, 8, 4.50, TRUE),
(6, 'Demo Supplier 06', 'Demo Contact 06', 'supplier06@example.com', '+91 00000 00016', 'Sample business address 06', 'Bengaluru', 'Karnataka', '000000', NULL, 5, 4.65, TRUE),
(7, 'Demo Supplier 07', 'Demo Contact 07', 'supplier07@example.com', '+91 00000 00017', 'Sample business address 07', 'Mumbai', 'Maharashtra', '000000', NULL, 4, 4.85, TRUE),
(8, 'Demo Supplier 08', 'Demo Contact 08', 'supplier08@example.com', '+91 00000 00018', 'Sample business address 08', 'Meerut', 'Uttar Pradesh', '000000', NULL, 9, 4.40, TRUE),
(9, 'Demo Supplier 09', 'Demo Contact 09', 'supplier09@example.com', '+91 00000 00019', 'Sample business address 09', 'Kolkata', 'West Bengal', '000000', NULL, 3, 4.70, TRUE),
(10, 'Demo Supplier 10', 'Demo Contact 10', 'supplier10@example.com', '+91 00000 00020', 'Sample business address 10', 'New Delhi', 'Delhi', '000000', NULL, 10, 4.30, TRUE),
(11, 'Demo Supplier 11', 'Demo Contact 11', 'supplier11@example.com', '+91 00000 00021', 'Sample business address 11', 'Mumbai', 'Maharashtra', '000000', NULL, 6, 4.55, TRUE),
-- Edge-case 3: Supplier with empty optional fields (no gstin, lowest rating, minimal phone)
(12, 'Demo Supplier 12', 'Demo Contact 12', 'supplier12@example.com', '+91 00000 00022', 'Sample business address 12', 'Jaipur', 'Rajasthan', '000000', NULL, 14, 3.20, TRUE);

SELECT setval('suppliers_id_seq', (SELECT MAX(id) FROM suppliers));

-- ----------------------------------------------------------------------------
-- 5. LOCATIONS (Warehouses & Stores across Metro and Tier-1 Indian Cities)
-- ----------------------------------------------------------------------------
INSERT INTO locations (id, name, code, location_type, address, city, state, pincode, contact_phone, manager_name, is_active) VALUES
(1, 'Demo Warehouse 01', 'WH-BHIW-01', 'WAREHOUSE', 'Sample warehouse address 01', 'Bhiwandi', 'Maharashtra', '000000', '+91 00000 00031', 'Demo Manager 01', TRUE),
(2, 'Demo Warehouse 02', 'WH-GUR-01', 'WAREHOUSE', 'Sample warehouse address 02', 'Gurugram', 'Haryana', '000000', '+91 00000 00032', 'Demo Manager 02', TRUE),
(3, 'Demo Warehouse 03', 'WH-BLR-01', 'WAREHOUSE', 'Sample warehouse address 03', 'Bengaluru', 'Karnataka', '000000', '+91 00000 00033', 'Demo Manager 03', TRUE),
(4, 'Demo Warehouse 04', 'WH-KOL-01', 'WAREHOUSE', 'Sample warehouse address 04', 'Hooghly', 'West Bengal', '000000', '+91 00000 00034', 'Demo Manager 04', TRUE),
(5, 'Demo Store 01', 'STR-MUM-01', 'STORE', 'Sample store address 01', 'Mumbai', 'Maharashtra', '000000', '+91 00000 00035', 'Demo Manager 05', TRUE),
(6, 'Demo Store 02', 'STR-DEL-01', 'STORE', 'Sample store address 02', 'New Delhi', 'Delhi', '000000', '+91 00000 00036', 'Demo Manager 06', TRUE),
(7, 'Demo Store 03', 'STR-BLR-01', 'STORE', 'Sample store address 03', 'Bengaluru', 'Karnataka', '000000', '+91 00000 00037', 'Demo Manager 07', TRUE),
(8, 'Demo Store 04', 'STR-CHE-01', 'STORE', 'Sample store address 04', 'Chennai', 'Tamil Nadu', '000000', '+91 00000 00038', 'Demo Manager 08', TRUE),
(9, 'Demo Store 05', 'STR-HYD-01', 'STORE', 'Sample store address 05', 'Hyderabad', 'Telangana', '000000', '+91 00000 00039', 'Demo Manager 09', TRUE),
(10, 'Demo Store 06', 'STR-KOL-01', 'STORE', 'Sample store address 06', 'Kolkata', 'West Bengal', '000000', '+91 00000 00040', 'Demo Manager 10', TRUE);

SELECT setval('locations_id_seq', (SELECT MAX(id) FROM locations));

-- ----------------------------------------------------------------------------
-- 6. PRODUCTS
-- ----------------------------------------------------------------------------
INSERT INTO products (id, sku, name, category_id, supplier_id, description, unit_of_measure, cost_price, selling_price, reorder_point, safety_stock, image_url, status) VALUES
(1, 'SKU-ELEC-BOAT-A450', 'boAt Airdopes 450 TWS Wireless Earbuds', 2, 4, 'Bluetooth 5.2 earbuds with 42 hours playback, ENx noise cancellation, and ASAP fast charge.', 'piece', 1199.00, 1999.00, 25, 10, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500', 'ACTIVE'),
(2, 'SKU-ELEC-HAV-IR10', 'Havells D'or 1100W Heavyweight Dry Iron', 1, 1, 'Aerodynamic design with Dupont American heritage non-stick Teflon coating.', 'piece', 850.00, 1349.00, 15, 5, 'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=500', 'ACTIVE'),
(3, 'SKU-FASH-RAY-SH01', 'Raymond Men Formal Slim Fit Cotton Shirt (Sky Blue)', 5, 3, '100% Giza cotton long-sleeve premium shirt designed for boardroom meetings.', 'piece', 1250.00, 2499.00, 20, 8, 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500', 'ACTIVE'),
(4, 'SKU-FASH-FAB-KU01', 'FabIndia Handloom Tussar Silk Kurti (Maroon)', 6, 10, 'Artisan-crafted women silk festive kurti with delicate zari embroidery.', 'piece', 1800.00, 3590.00, 12, 4, 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500', 'ACTIVE'),
(5, 'SKU-GROC-TATA-TEA', 'Tata Tea Gold Leaf Pouch 1kg', 7, 2, 'Fine tea blend with 15% gently rolled long tea leaves for rich aroma and brisk taste.', 'kg', 420.00, 560.00, 50, 20, 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500', 'ACTIVE'),
(6, 'SKU-HOME-PRES-CK05', 'Prestige Deluxe Alpha Stainless Steel Pressure Cooker 5L', 8, 5, 'Induction base heavy-gauge stainless steel with controlled gasket release system.', 'piece', 2100.00, 3150.00, 15, 6, 'https://images.unsplash.com/photo-1584990347449-34b54b1d62c9?w=500', 'ACTIVE'),
(7, 'SKU-HLTH-HIM-FW01', 'Himalaya Purifying Neem Face Wash 400ml', 9, 6, 'Herbal formulation containing Neem and Turmeric to treat pimples and clear pores.', 'piece', 240.00, 375.00, 40, 15, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500', 'ACTIVE'),
(8, 'SKU-SPRT-SG-BAT01', 'SG Savage English Willow Cricket Bat Full Size', 10, 8, 'Grade 1 English willow with thick edges and toe guard for explosive power strokeplay.', 'piece', 6200.00, 10499.00, 8, 3, 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=500', 'ACTIVE'),
(9, 'SKU-STAT-ITC-NB06', 'Classmate Spiral Bound Notebook A4 Pack of 6', 11, 9, '300 pages chlorine-free eco-friendly smooth white paper with single ruled sheets.', 'box', 390.00, 600.00, 30, 10, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500', 'ACTIVE'),
(10, 'SKU-HOME-MIL-BOT1', 'Milton Thermosteel Flip Lid Flask 1000ml', 8, 11, 'Double-walled vacuum insulated 304 food-grade stainless steel bottle keeping beverages hot/cold 24h.', 'piece', 680.00, 1099.00, 35, 12, 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500', 'ACTIVE'),
(11, 'SKU-ELEC-BOAT-SPK1', 'boAt Stone 650 10W Bluetooth Speaker', 1, 4, 'IPX6 water-resistant wireless speaker with punchy bass and 7 hours battery backup.', 'piece', 1100.00, 1899.00, 20, 8, 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=500', 'ACTIVE'),
(12, 'SKU-HLTH-GOD-SOAP', 'Godrej Cinthol Original Deodorant Soap Pack of 6', 9, 7, 'Germ protection bath soap with cooling fragrance and deodorant protection.', 'box', 180.00, 270.00, 50, 20, 'https://images.unsplash.com/photo-1607006314184-7a353d25686d?w=500', 'ACTIVE'),
(13, 'SKU-GROC-TATA-DAL', 'Tata Sampann Unpolished Toor Dal 1kg', 7, 2, 'Naturally protein-rich dal with no artificial polishing to retain natural nutritional goodness.', 'kg', 145.00, 195.00, 60, 25, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', 'ACTIVE'),
(14, 'SKU-COMP-LOGI-KB01', 'Wireless Multi-Device Keyboard K380 Compact', 3, 4, 'Connects up to 3 Bluetooth devices simultaneously across Windows, Mac, iPad.', 'piece', 1950.00, 2995.00, 15, 5, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500', 'ACTIVE'),
-- Edge-case 4: Product with null description, null image, and lowest possible margin
(15, 'SKU-RAW-GENERIC-COTTON', 'Raw Organic Carded Cotton Fibre Batch 50kg', 4, 12, NULL, 'kg', 4999.00, 5000.00, 5, 0, NULL, 'ACTIVE'),
-- Edge-case 5: Discontinued Product with identical naming variant
(16, 'SKU-ELEC-BOAT-A450-V1', 'boAt Airdopes 450 TWS Wireless Earbuds (Legacy Gen 1)', 2, 4, 'First generation model replaced by modern V2 line.', 'piece', 999.00, 1499.00, 0, 0, NULL, 'DISCONTINUED');

SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));

-- ----------------------------------------------------------------------------
-- 7. CUSTOMERS
-- ----------------------------------------------------------------------------
INSERT INTO customers (id, name, email, phone, address, city, state, pincode) VALUES
(1, 'Demo Customer 01', 'customer01@example.com', '+91 00000 00101', 'Sample address 01', 'Mumbai', 'Maharashtra', '000000'),
(2, 'Demo Customer 02', 'customer02@example.com', '+91 00000 00102', 'Sample address 02', 'Kolkata', 'West Bengal', '000000'),
(3, 'Demo Customer 03', 'customer03@example.com', '+91 00000 00103', 'Sample address 03', 'Chennai', 'Tamil Nadu', '000000'),
(4, 'Demo Customer 04', 'customer04@example.com', '+91 00000 00104', 'Sample address 04', 'New Delhi', 'Delhi', '000000'),
(5, 'Demo Customer 05', 'customer05@example.com', '+91 00000 00105', 'Sample address 05', 'Bengaluru', 'Karnataka', '000000'),
(6, 'Demo Customer 06', 'customer06@example.com', '+91 00000 00106', 'Sample address 06', 'Gurugram', 'Haryana', '000000'),
(7, 'Demo Customer 07', 'customer07@example.com', '+91 00000 00107', 'Sample address 07', 'Jaipur', 'Rajasthan', '000000'),
(8, 'Demo Customer 08', 'customer08@example.com', '+91 00000 00108', 'Sample address 08', 'Pune', 'Maharashtra', '000000'),
(9, 'Demo Customer 09', 'customer09@example.com', '+91 00000 00109', 'Sample address 09', 'Ahmedabad', 'Gujarat', '000000'),
(10, 'Demo Customer 10', 'customer10@example.com', '+91 00000 00110', 'Sample address 10', 'Hyderabad', 'Telangana', '000000'),
(11, 'Demo Customer 11', 'customer11@example.com', '+91 00000 00111', 'Sample address 11', 'Pune', 'Maharashtra', '000000'),
(12, 'Demo Customer 12', 'customer12@example.com', '+91 00000 00112', 'Sample address 12', 'Gurugram', 'Haryana', '000000'),
(13, 'Demo Customer 13', 'customer13@example.com', '+91 00000 00113', 'Sample address 13', 'Kolkata', 'West Bengal', '000000'),
(14, 'Demo Customer 14', 'customer14@example.com', '+91 00000 00114', 'Sample address 14', 'Lucknow', 'Uttar Pradesh', '000000'),
-- Edge-case 6: Customer without email and minimal address
(15, 'Demo Customer 15', NULL, '+91 00000 00115', 'Sample address 15', 'Madurai', 'Tamil Nadu', '000000');

SELECT setval('customers_id_seq', (SELECT MAX(id) FROM customers));

-- ----------------------------------------------------------------------------
-- 8. INVENTORY_ITEMS (Multi-location Stock across 4 Warehouses & 6 Stores)
-- ----------------------------------------------------------------------------
INSERT INTO inventory_items (id, product_id, location_id, quantity_on_hand, quantity_reserved, aisle_shelf, last_stock_take_at) VALUES
-- Warehouse Bhiwandi (Location 1)
(1, 1, 1, 350, 15, 'Aisle-A1-S01', '2024-05-01 10:00:00+05:30'),
(2, 2, 1, 120, 5, 'Aisle-A1-S02', '2024-05-01 10:00:00+05:30'),
(3, 3, 1, 240, 20, 'Aisle-B2-S01', '2024-05-01 11:30:00+05:30'),
(4, 4, 1, 80, 8, 'Aisle-B2-S02', '2024-05-01 11:30:00+05:30'),
(5, 5, 1, 600, 50, 'Aisle-C3-S01', '2024-05-01 14:00:00+05:30'),
(6, 6, 1, 110, 10, 'Aisle-D4-S01', '2024-05-01 15:00:00+05:30'),
(7, 7, 1, 450, 25, 'Aisle-E5-S01', '2024-05-01 16:00:00+05:30'),
(8, 8, 1, 40, 4, 'Aisle-F6-S01', '2024-05-01 16:30:00+05:30'),
(9, 9, 1, 280, 30, 'Aisle-G7-S01', '2024-05-01 17:00:00+05:30'),
(10, 10, 1, 210, 15, 'Aisle-D4-S02', '2024-05-01 17:30:00+05:30'),
(11, 11, 1, 140, 10, 'Aisle-A1-S03', '2024-05-01 18:00:00+05:30'),
(12, 12, 1, 520, 40, 'Aisle-E5-S02', '2024-05-01 18:30:00+05:30'),
(13, 13, 1, 480, 20, 'Aisle-C3-S02', '2024-05-01 19:00:00+05:30'),
(14, 14, 1, 95, 6, 'Aisle-A2-S01', '2024-05-01 19:30:00+05:30'),
(15, 15, 1, 20, 0, 'Aisle-H1-S01', '2024-05-01 20:00:00+05:30'),
(16, 16, 1, 0, 0, 'Aisle-Z9-S99', '2024-05-01 20:30:00+05:30'),

-- Warehouse Gurugram (Location 2)
(17, 1, 2, 420, 30, 'Aisle-G1-01', '2024-05-02 09:30:00+05:30'),
(18, 2, 2, 150, 12, 'Aisle-G1-02', '2024-05-02 09:30:00+05:30'),
(19, 3, 2, 190, 10, 'Aisle-G2-01', '2024-05-02 10:00:00+05:30'),
(20, 4, 2, 95, 5, 'Aisle-G2-02', '2024-05-02 10:00:00+05:30'),
(21, 5, 2, 500, 35, 'Aisle-G3-01', '2024-05-02 11:00:00+05:30'),
(22, 6, 2, 130, 8, 'Aisle-G4-01', '2024-05-02 11:30:00+05:30'),
(23, 7, 2, 380, 20, 'Aisle-G5-01', '2024-05-02 12:00:00+05:30'),
(24, 8, 2, 65, 5, 'Aisle-G6-01', '2024-05-02 14:00:00+05:30'),
(25, 9, 2, 310, 25, 'Aisle-G7-01', '2024-05-02 14:30:00+05:30'),
(26, 10, 2, 180, 10, 'Aisle-G4-02', '2024-05-02 15:00:00+05:30'),
(27, 11, 2, 160, 15, 'Aisle-G1-03', '2024-05-02 15:30:00+05:30'),
(28, 12, 2, 450, 30, 'Aisle-G5-02', '2024-05-02 16:00:00+05:30'),
(29, 13, 2, 390, 15, 'Aisle-G3-02', '2024-05-02 16:30:00+05:30'),
(30, 14, 2, 85, 4, 'Aisle-G1-04', '2024-05-02 17:00:00+05:30'),

-- Warehouse Whitefield Bengaluru (Location 3)
(31, 1, 3, 300, 20, 'Rack-W1-01', '2024-05-03 10:00:00+05:30'),
(32, 3, 3, 160, 15, 'Rack-W2-01', '2024-05-03 10:30:00+05:30'),
(33, 5, 3, 400, 40, 'Rack-W3-01', '2024-05-03 11:00:00+05:30'),
(34, 7, 3, 350, 20, 'Rack-W5-01', '2024-05-03 11:30:00+05:30'),
(35, 10, 3, 150, 10, 'Rack-W4-01', '2024-05-03 14:00:00+05:30'),
(36, 11, 3, 110, 5, 'Rack-W1-02', '2024-05-03 14:30:00+05:30'),
(37, 14, 3, 120, 12, 'Rack-W1-03', '2024-05-03 15:00:00+05:30'),

-- Retail Store Bandra West Mumbai (Location 5)
(38, 1, 5, 28, 2, 'Shelf-E01', '2024-05-04 11:00:00+05:30'),
(39, 2, 5, 14, 1, 'Shelf-H02', '2024-05-04 11:00:00+05:30'),
(40, 3, 5, 35, 3, 'Rack-F01', '2024-05-04 11:30:00+05:30'),
(41, 4, 5, 18, 2, 'Rack-F02', '2024-05-04 11:30:00+05:30'),
(42, 5, 5, 45, 5, 'Groc-G01', '2024-05-04 12:00:00+05:30'),
(43, 6, 5, 12, 1, 'Home-K01', '2024-05-04 12:30:00+05:30'),
(44, 7, 5, 55, 4, 'Care-C01', '2024-05-04 14:00:00+05:30'),
(45, 8, 5, 6, 1, 'Sport-S01', '2024-05-04 14:30:00+05:30'),
(46, 9, 5, 25, 2, 'Stat-S01', '2024-05-04 15:00:00+05:30'),
(47, 10, 5, 22, 2, 'Home-K02', '2024-05-04 15:30:00+05:30'),
(48, 11, 5, 16, 1, 'Shelf-E02', '2024-05-04 16:00:00+05:30'),
(49, 12, 5, 40, 3, 'Care-C02', '2024-05-04 16:30:00+05:30'),
(50, 13, 5, 38, 2, 'Groc-G02', '2024-05-04 17:00:00+05:30'),
(51, 14, 5, 15, 2, 'Shelf-E03', '2024-05-04 17:30:00+05:30'),

-- Retail Store Connaught Place Delhi (Location 6)
(52, 1, 6, 32, 4, 'Store-A1', '2024-05-05 10:00:00+05:30'),
(53, 3, 6, 40, 5, 'Store-B1', '2024-05-05 10:30:00+05:30'),
(54, 4, 6, 25, 2, 'Store-B2', '2024-05-05 11:00:00+05:30'),
(55, 6, 6, 8, 0, 'Store-C1', '2024-05-05 11:30:00+05:30'),
(56, 8, 6, 5, 1, 'Store-D1', '2024-05-05 14:00:00+05:30'),
(57, 10, 6, 19, 1, 'Store-C2', '2024-05-05 14:30:00+05:30'),
(58, 11, 6, 22, 3, 'Store-A2', '2024-05-05 15:00:00+05:30'),
(59, 14, 6, 18, 2, 'Store-A3', '2024-05-05 15:30:00+05:30'),

-- Retail Store Indiranagar Bengaluru (Location 7)
(60, 1, 7, 45, 5, 'Dis-01', '2024-05-06 10:00:00+05:30'),
(61, 3, 7, 30, 2, 'Dis-02', '2024-05-06 10:30:00+05:30'),
(62, 5, 7, 65, 4, 'Dis-03', '2024-05-06 11:00:00+05:30'),
(63, 7, 7, 70, 5, 'Dis-04', '2024-05-06 11:30:00+05:30'),
(64, 10, 7, 28, 2, 'Dis-05', '2024-05-06 14:00:00+05:30'),
(65, 14, 7, 24, 3, 'Dis-06', '2024-05-06 14:30:00+05:30');

SELECT setval('inventory_items_id_seq', (SELECT MAX(id) FROM inventory_items));

-- ----------------------------------------------------------------------------
-- 9. STOCK_TRANSFERS & ITEMS
-- ----------------------------------------------------------------------------
INSERT INTO stock_transfers (id, transfer_number, from_location_id, to_location_id, status, initiated_by_user_id, transfer_date, completed_date, notes) VALUES
(1, 'TRF-2024-001', 1, 5, 'COMPLETED', 2, '2024-04-10 10:00:00+05:30', '2024-04-11 15:30:00+05:30', 'Routine weekly replenishment for Bandra retail store'),
(2, 'TRF-2024-002', 2, 6, 'COMPLETED', 3, '2024-04-12 11:15:00+05:30', '2024-04-13 14:00:00+05:30', 'Connaught Place urgent restocking for weekend rush'),
(3, 'TRF-2024-003', 3, 7, 'COMPLETED', 4, '2024-04-15 09:45:00+05:30', '2024-04-16 11:00:00+05:30', 'Bangalore Whitefield to Indiranagar store transfer'),
(4, 'TRF-2024-004', 1, 8, 'IN_TRANSIT', 2, '2024-05-10 08:30:00+05:30', NULL, 'Inter-state transfer from Bhiwandi WH to Chennai T.Nagar store via BlueDart'),
(5, 'TRF-2024-005', 2, 9, 'PENDING', 3, '2024-05-15 14:20:00+05:30', NULL, 'Pending dispatch to Banjara Hills Hyderabad store'),
(6, 'TRF-2024-006', 1, 3, 'COMPLETED', 1, '2024-05-01 10:00:00+05:30', '2024-05-04 18:00:00+05:30', 'Bulk inter-warehouse rebalance from Bhiwandi to Whitefield'),
(7, 'TRF-2024-007', 2, 1, 'CANCELLED', 3, '2024-05-05 12:00:00+05:30', NULL, 'Cancelled due to truck breakdown and alternate route scheduling');

SELECT setval('stock_transfers_id_seq', (SELECT MAX(id) FROM stock_transfers));

INSERT INTO stock_transfer_items (id, transfer_id, product_id, quantity, received_quantity) VALUES
(1, 1, 1, 20, 20),
(2, 1, 3, 15, 15),
(3, 1, 5, 30, 30),
(4, 2, 1, 25, 25),
(5, 2, 4, 15, 15),
(6, 2, 11, 20, 20),
(7, 3, 1, 30, 30),
(8, 3, 10, 15, 15),
(9, 3, 14, 20, 20),
(10, 4, 1, 40, 0),
(11, 4, 6, 10, 0),
(12, 4, 8, 5, 0),
(13, 5, 1, 30, 0),
(14, 5, 2, 15, 0),
(15, 6, 1, 100, 100),
(16, 6, 7, 100, 100),
(17, 7, 3, 50, 0);

SELECT setval('stock_transfer_items_id_seq', (SELECT MAX(id) FROM stock_transfer_items));

-- ----------------------------------------------------------------------------
-- 10. STOCK_ADJUSTMENTS
-- ----------------------------------------------------------------------------
INSERT INTO stock_adjustments (id, adjustment_number, location_id, product_id, previous_quantity, adjusted_quantity, difference, reason, adjusted_by_user_id, created_at, notes) VALUES
(1, 'ADJ-2024-001', 1, 1, 352, 350, -2, 'DAMAGE', 2, '2024-04-05 14:00:00+05:30', '2 earphones boxes crushed during pallet movement in warehouse'),
(2, 'ADJ-2024-002', 5, 7, 58, 55, -3, 'AUDIT_DISCREPANCY', 10, '2024-04-12 18:00:00+05:30', 'Cycle count physical discrepancy during quarterly store audit'),
(3, 'ADJ-2024-003', 2, 12, 445, 450, 5, 'RETURN', 3, '2024-04-15 11:30:00+05:30', 'Customer verified unopened return added back to active inventory'),
(4, 'ADJ-2024-004', 6, 6, 9, 8, -1, 'DAMAGE', 6, '2024-04-20 16:45:00+05:30', 'Display unit scratched pressure cooker removed from stock'),
(5, 'ADJ-2024-005', 3, 14, 118, 120, 2, 'AUDIT_DISCREPANCY', 10, '2024-05-02 12:00:00+05:30', 'Found extra 2 sealed keyboards during physical stock-take in rack W1');

SELECT setval('stock_adjustments_id_seq', (SELECT MAX(id) FROM stock_adjustments));

-- ----------------------------------------------------------------------------
-- 11. PURCHASE_ORDERS & ITEMS (Suppliers to Warehouses)
-- ----------------------------------------------------------------------------
INSERT INTO purchase_orders (id, po_number, supplier_id, destination_location_id, status, total_amount, order_date, expected_delivery_date, actual_delivery_date, created_by_user_id, notes) VALUES
(1, 'PO-2024-001', 4, 1, 'RECEIVED', 239800.00, '2024-03-01 10:00:00+05:30', '2024-03-07', '2024-03-06 14:00:00+05:30', 2, 'Spring replenishment for boAt earbuds'),
(2, 'PO-2024-002', 2, 1, 'RECEIVED', 168000.00, '2024-03-05 11:30:00+05:30', '2024-03-09', '2024-03-09 11:00:00+05:30', 2, 'Tata Tea Gold bulk restock for Mumbai hub'),
(3, 'PO-2024-003', 1, 2, 'RECEIVED', 127500.00, '2024-03-10 14:00:00+05:30', '2024-03-15', '2024-03-14 16:30:00+05:30', 3, 'Havells irons stock procurement for North hub'),
(4, 'PO-2024-004', 3, 1, 'RECEIVED', 250000.00, '2024-03-15 09:30:00+05:30', '2024-03-22', '2024-03-21 17:00:00+05:30', 2, 'Raymond formal shirts order'),
(5, 'PO-2024-005', 5, 2, 'RECEIVED', 210000.00, '2024-03-20 15:00:00+05:30', '2024-03-28', '2024-03-27 12:00:00+05:30', 3, 'Prestige cookers bulk order'),
(6, 'PO-2024-006', 6, 3, 'RECEIVED', 96000.00, '2024-03-25 10:45:00+05:30', '2024-03-30', '2024-03-29 15:30:00+05:30', 4, 'Himalaya neem face wash shipment for Bangalore WH'),
(7, 'PO-2024-007', 8, 2, 'RECEIVED', 310000.00, '2024-04-01 11:00:00+05:30', '2024-04-10', '2024-04-09 13:00:00+05:30', 3, 'SG Cricket bats procurement before summer season'),
(8, 'PO-2024-008', 9, 1, 'RECEIVED', 117000.00, '2024-04-05 12:15:00+05:30', '2024-04-08', '2024-04-08 14:45:00+05:30', 2, 'Classmate spiral notebook sets for schools start'),
(9, 'PO-2024-009', 11, 1, 'RECEIVED', 136000.00, '2024-04-10 16:00:00+05:30', '2024-04-16', '2024-04-15 11:00:00+05:30', 2, 'Milton flasks replenishment'),
(10, 'PO-2024-010', 4, 2, 'ORDERED', 239800.00, '2024-05-12 10:00:00+05:30', '2024-05-18', NULL, 3, 'Mid-year boAt stock restock currently in transit'),
(11, 'PO-2024-011', 2, 3, 'ORDERED', 87000.00, '2024-05-14 11:30:00+05:30', '2024-05-19', NULL, 4, 'Tata Sampann toor dal order for Bangalore warehouse'),
(12, 'PO-2024-012', 10, 1, 'DRAFT', 180000.00, '2024-05-18 17:00:00+05:30', '2024-05-28', NULL, 2, 'Festive kurtis order draft undergoing pricing approval'),
(13, 'PO-2024-013', 7, 2, 'CANCELLED', 90000.00, '2024-04-15 14:00:00+05:30', '2024-04-20', NULL, 3, 'Cancelled duplicate PO with Godrej');

SELECT setval('purchase_orders_id_seq', (SELECT MAX(id) FROM purchase_orders));

INSERT INTO purchase_order_items (id, purchase_order_id, product_id, quantity_ordered, quantity_received, unit_cost, subtotal) VALUES
(1, 1, 1, 200, 200, 1199.00, 239800.00),
(2, 2, 5, 400, 400, 420.00, 168000.00),
(3, 3, 2, 150, 150, 850.00, 127500.00),
(4, 4, 3, 200, 200, 1250.00, 250000.00),
(5, 5, 6, 100, 100, 2100.00, 210000.00),
(6, 6, 7, 400, 400, 240.00, 96000.00),
(7, 7, 8, 50, 50, 6200.00, 310000.00),
(8, 8, 9, 300, 300, 390.00, 117000.00),
(9, 9, 10, 200, 200, 680.00, 136000.00),
(10, 10, 1, 200, 0, 1199.00, 239800.00),
(11, 11, 13, 600, 0, 145.00, 87000.00),
(12, 12, 4, 100, 0, 1800.00, 180000.00),
(13, 13, 12, 500, 0, 180.00, 90000.00);

SELECT setval('purchase_order_items_id_seq', (SELECT MAX(id) FROM purchase_order_items));

-- ----------------------------------------------------------------------------
-- 12. ORDERS & ORDER_ITEMS (Sales Orders)
-- ----------------------------------------------------------------------------
INSERT INTO orders (id, order_number, customer_id, location_id, status, total_amount, payment_status, payment_method, order_date, shipped_date, delivery_date, notes) VALUES
(1, 'ORD-2024-001', 1, 5, 'DELIVERED', 5148.00, 'PAID', 'UPI', '2024-04-01 11:20:00+05:30', '2024-04-01 14:00:00+05:30', '2024-04-01 16:30:00+05:30', 'In-store express pickup at Bandra store'),
(2, 'ORD-2024-002', 4, 6, 'DELIVERED', 13494.00, 'PAID', 'CREDIT_CARD', '2024-04-02 12:45:00+05:30', '2024-04-02 16:00:00+05:30', '2024-04-03 11:00:00+05:30', 'Delivered to Golf Links residence'),
(3, 'ORD-2024-003', 5, 7, 'DELIVERED', 4749.00, 'PAID', 'UPI', '2024-04-03 15:10:00+05:30', '2024-04-03 18:00:00+05:30', '2024-04-04 10:30:00+05:30', 'Home delivery Whitefield Bangalore'),
(4, 'ORD-2024-004', 3, 8, 'DELIVERED', 3150.00, 'PAID', 'DEBIT_CARD', '2024-04-05 16:20:00+05:30', '2024-04-05 18:00:00+05:30', '2024-04-06 14:00:00+05:30', 'Delivered to Anna Nagar'),
(5, 'ORD-2024-005', 6, 6, 'DELIVERED', 15493.00, 'PAID', 'CREDIT_CARD', '2024-04-07 10:30:00+05:30', '2024-04-07 14:00:00+05:30', '2024-04-08 11:00:00+05:30', 'Luxury order delivered to DLF Gurugram'),
(6, 'ORD-2024-006', 2, 10, 'DELIVERED', 2399.00, 'PAID', 'UPI', '2024-04-09 14:15:00+05:30', '2024-04-09 17:00:00+05:30', '2024-04-10 12:00:00+05:30', 'South City Mall retail purchase'),
(7, 'ORD-2024-007', 8, 5, 'DELIVERED', 4398.00, 'PAID', 'UPI', '2024-04-12 17:40:00+05:30', '2024-04-13 10:00:00+05:30', '2024-04-14 15:00:00+05:30', 'Bandra store order'),
(8, 'ORD-2024-008', 7, 5, 'DELIVERED', 7180.00, 'PAID', 'NET_BANKING', '2024-04-15 13:00:00+05:30', '2024-04-15 16:00:00+05:30', '2024-04-17 11:30:00+05:30', 'Dispatched to Jaipur address'),
(9, 'ORD-2024-009', 9, 5, 'DELIVERED', 2995.00, 'PAID', 'UPI', '2024-04-18 11:10:00+05:30', '2024-04-18 14:30:00+05:30', '2024-04-19 16:00:00+05:30', 'Logitech multi-device keyboard'),
(10, 'ORD-2024-010', 10, 9, 'DELIVERED', 8496.00, 'PAID', 'CREDIT_CARD', '2024-04-20 18:30:00+05:30', '2024-04-21 11:00:00+05:30', '2024-04-22 13:00:00+05:30', 'Hyderabad store order'),
(11, 'ORD-2024-011', 11, 5, 'DELIVERED', 1659.00, 'PAID', 'UPI', '2024-04-23 12:00:00+05:30', '2024-04-23 15:00:00+05:30', '2024-04-24 10:00:00+05:30', 'Household FMCG basket'),
(12, 'ORD-2024-012', 12, 6, 'DELIVERED', 10499.00, 'PAID', 'CREDIT_CARD', '2024-04-25 15:20:00+05:30', '2024-04-25 17:30:00+05:30', '2024-04-26 14:00:00+05:30', 'Cricket gear purchase'),
(13, 'ORD-2024-013', 13, 10, 'DELIVERED', 5589.00, 'PAID', 'UPI', '2024-04-28 16:00:00+05:30', '2024-04-28 18:30:00+05:30', '2024-04-29 11:00:00+05:30', 'Kolkata customer order'),
(14, 'ORD-2024-014', 14, 6, 'DELIVERED', 4248.00, 'PAID', 'NET_BANKING', '2024-04-30 14:40:00+05:30', '2024-05-01 10:00:00+05:30', '2024-05-02 15:00:00+05:30', 'Shipped to Lucknow'),
(15, 'ORD-2024-015', 1, 5, 'DELIVERED', 3798.00, 'PAID', 'UPI', '2024-05-02 11:00:00+05:30', '2024-05-02 14:00:00+05:30', '2024-05-03 10:00:00+05:30', 'boAt audio gear repeat order'),
(16, 'ORD-2024-016', 3, 8, 'DELIVERED', 1200.00, 'PAID', 'CASH', '2024-05-05 16:15:00+05:30', '2024-05-05 17:00:00+05:30', '2024-05-05 17:30:00+05:30', 'Direct retail cash counter sale'),
(17, 'ORD-2024-017', 4, 6, 'DELIVERED', 6189.00, 'PAID', 'UPI', '2024-05-07 13:20:00+05:30', '2024-05-07 16:00:00+05:30', '2024-05-08 11:00:00+05:30', 'Home and cookware selection'),
(18, 'ORD-2024-018', 5, 7, 'SHIPPED', 5994.00, 'PAID', 'CREDIT_CARD', '2024-05-10 10:30:00+05:30', '2024-05-11 09:00:00+05:30', NULL, 'In transit with courier Delhivery'),
(19, 'ORD-2024-019', 6, 6, 'SHIPPED', 4998.00, 'PAID', 'UPI', '2024-05-11 14:00:00+05:30', '2024-05-12 10:30:00+05:30', NULL, 'Raymond formal shirts out for delivery'),
(20, 'ORD-2024-020', 2, 5, 'PACKED', 3590.00, 'PAID', 'UPI', '2024-05-12 11:45:00+05:30', NULL, NULL, 'Packed and ready for pickup at Bandra store'),
(21, 'ORD-2024-021', 8, 5, 'PROCESSING', 1999.00, 'PAID', 'UPI', '2024-05-13 15:20:00+05:30', NULL, NULL, 'Payment confirmed, picking items from warehouse'),
(22, 'ORD-2024-022', 9, 7, 'PROCESSING', 4248.00, 'PAID', 'CREDIT_CARD', '2024-05-14 09:10:00+05:30', NULL, NULL, 'Processing order at Indiranagar store'),
(23, 'ORD-2024-023', 10, 9, 'PENDING', 2198.00, 'PENDING', 'UPI', '2024-05-15 16:45:00+05:30', NULL, NULL, 'Awaiting customer payment confirmation'),
(24, 'ORD-2024-024', 11, 5, 'CANCELLED', 1349.00, 'REFUNDED', 'UPI', '2024-05-03 14:00:00+05:30', NULL, NULL, 'Customer cancelled order before dispatch; full refund issued via UPI'),
(25, 'ORD-2024-025', 15, 8, 'DELIVERED', 560.00, 'PAID', 'CASH', '2024-05-08 17:30:00+05:30', '2024-05-08 17:45:00+05:30', '2024-05-08 18:00:00+05:30', 'Cash on delivery OTC order');

SELECT setval('orders_id_seq', (SELECT MAX(id) FROM orders));

INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, subtotal) VALUES
(1, 1, 1, 1, 1999.00, 1999.00),
(2, 1, 3, 1, 2499.00, 2499.00),
(3, 1, 10, 1, 650.00, 650.00),
(4, 2, 1, 1, 1999.00, 1999.00),
(5, 2, 8, 1, 10499.00, 10499.00),
(6, 2, 10, 1, 996.00, 996.00),
(7, 3, 11, 1, 1899.00, 1899.00),
(8, 3, 14, 1, 2850.00, 2850.00),
(9, 4, 6, 1, 3150.00, 3150.00),
(10, 5, 3, 2, 2499.00, 4998.00),
(11, 5, 8, 1, 10495.00, 10495.00),
(12, 6, 1, 1, 1999.00, 1999.00),
(13, 6, 7, 1, 400.00, 400.00),
(14, 7, 1, 1, 1999.00, 1999.00),
(15, 7, 3, 1, 2399.00, 2399.00),
(16, 8, 4, 2, 3590.00, 7180.00),
(17, 9, 14, 1, 2995.00, 2995.00),
(18, 10, 1, 2, 1999.00, 3998.00),
(19, 10, 3, 1, 2499.00, 2499.00),
(20, 10, 11, 1, 1999.00, 1999.00),
(21, 11, 5, 1, 560.00, 560.00),
(22, 11, 7, 1, 375.00, 375.00),
(23, 11, 12, 2, 270.00, 540.00),
(24, 11, 13, 1, 184.00, 184.00),
(25, 12, 8, 1, 10499.00, 10499.00),
(26, 13, 4, 1, 3590.00, 3590.00),
(27, 13, 1, 1, 1999.00, 1999.00),
(28, 14, 10, 2, 1099.00, 2198.00),
(29, 14, 14, 1, 2050.00, 2050.00),
(30, 15, 1, 1, 1999.00, 1999.00),
(31, 15, 11, 1, 1799.00, 1799.00),
(32, 16, 9, 2, 600.00, 1200.00),
(33, 17, 2, 1, 1349.00, 1349.00),
(34, 17, 6, 1, 3150.00, 3150.00),
(35, 17, 10, 1, 1690.00, 1690.00),
(36, 18, 1, 1, 1999.00, 1999.00),
(37, 18, 14, 1, 2995.00, 2995.00),
(38, 18, 10, 1, 1000.00, 1000.00),
(39, 19, 3, 2, 2499.00, 4998.00),
(40, 20, 4, 1, 3590.00, 3590.00),
(41, 21, 1, 1, 1999.00, 1999.00),
(42, 22, 1, 1, 1999.00, 1999.00),
(43, 22, 10, 2, 1124.50, 2249.00),
(44, 23, 10, 2, 1099.00, 2198.00),
(45, 24, 2, 1, 1349.00, 1349.00),
(46, 25, 5, 1, 560.00, 560.00);

SELECT setval('order_items_id_seq', (SELECT MAX(id) FROM order_items));
