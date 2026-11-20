import os
from decimal import Decimal
from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth import get_user_model
from django.utils import timezone
from users.models import Role
from products.models import Category, Product
from suppliers.models import Supplier, PurchaseOrder, PurchaseOrderItem
from inventory.models import Location, InventoryItem, StockTransfer, StockTransferItem, StockAdjustment
from orders.models import Customer, Order, OrderItem

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds database with realistic retail inventory data for StockSmart (Indian Context)'

    def handle(self, *args, **options):
        seed_password = os.getenv("STOCKSMART_SEED_PASSWORD")
        if not seed_password:
            raise CommandError(
                "Set STOCKSMART_SEED_PASSWORD to a unique local password before seeding."
            )

        self.stdout.write("Starting StockSmart database seeding...")

        # 1. Roles
        roles_data = [
            (Role.ADMIN, "Superuser with full administrative access"),
            (Role.WAREHOUSE_MANAGER, "Manages warehouse inventory levels and PO receipts"),
            (Role.STORE_ASSOCIATE, "Retail store staff handling sales orders and requests"),
            (Role.INVENTORY_AUDITOR, "Auditor role with stock adjustment and verification rights"),
        ]
        roles_dict = {}
        for name, desc in roles_data:
            role, _ = Role.objects.get_or_create(name=name, defaults={'description': desc})
            roles_dict[name] = role

        # 2. Users
        users_data = [
            ("demo_admin", "admin@example.com", "Demo", "Admin", "+91 00000 00001", Role.ADMIN, True, True),
            ("demo_wh_manager", "warehouse@example.com", "Demo", "Warehouse Manager", "+91 00000 00002", Role.WAREHOUSE_MANAGER, False, False),
            ("demo_store_associate", "store@example.com", "Demo", "Store Associate", "+91 00000 00003", Role.STORE_ASSOCIATE, False, False),
            ("demo_auditor", "auditor@example.com", "Demo", "Auditor", "+91 00000 00004", Role.INVENTORY_AUDITOR, False, False),
        ]
        for uname, email, fname, lname, phone, role_name, is_staff, is_super in users_data:
            if not User.objects.filter(username=uname).exists():
                u = User.objects.create_user(
                    username=uname,
                    email=email,
                    password=seed_password,
                    first_name=fname,
                    last_name=lname,
                    phone=phone,
                    role=roles_dict[role_name],
                    is_staff=is_staff,
                    is_superuser=is_super
                )
                self.stdout.write(f"Created user: {uname}")

        admin_user = User.objects.get(username="demo_admin")

        # 3. Categories
        cats_data = [
            ("Electronics & Appliances", "CAT-ELEC", "Consumer electronics, audio and home appliances", None),
            ("Smartphones & Tablets", "CAT-MOB", "Mobile devices and accessories", "CAT-ELEC"),
            ("Computing & Laptops", "CAT-COMP", "Laptops, monitors and peripherals", "CAT-ELEC"),
            ("Fashion & Apparel", "CAT-FASH", "Men, women and kids clothing", None),
            ("Men Fashion", "CAT-MEN", "Shirts, trousers and accessories", "CAT-FASH"),
            ("Women Fashion", "CAT-WOMEN", "Kurtis, sarees and dresses", "CAT-FASH"),
            ("Groceries & Staples", "CAT-GROC", "Food grains, edible oil, tea and spices", None),
            ("Home & Kitchen", "CAT-HOME", "Cookware, storage, home utilities", None),
            ("Health & Personal Care", "CAT-HLTH", "Hygiene, skincare and wellness", None),
            ("Sports & Fitness", "CAT-SPRT", "Cricket, gym equipment and sportswear", None),
            ("Stationery & Books", "CAT-STAT", "Paper supplies, notebooks and pens", None),
        ]
        cat_map = {}
        for name, code, desc, parent_code in cats_data:
            parent = cat_map.get(parent_code) if parent_code else None
            cat, _ = Category.objects.get_or_create(
                code=code,
                defaults={'name': name, 'description': desc, 'parent_category': parent}
            )
            cat_map[code] = cat

        # 4. Suppliers
        suppliers_data = [
            ("Demo Supplier 01", "Demo Contact 01", "supplier01@example.com", "+91 00000 00011", "Sample business address 01", "Noida", "Uttar Pradesh", "000000", None, 5, Decimal('4.80')),
            ("Demo Supplier 02", "Demo Contact 02", "supplier02@example.com", "+91 00000 00012", "Sample business address 02", "Mumbai", "Maharashtra", "000000", None, 4, Decimal('4.90')),
            ("Demo Supplier 03", "Demo Contact 03", "supplier03@example.com", "+91 00000 00013", "Sample business address 03", "Thane", "Maharashtra", "000000", None, 7, Decimal('4.60')),
            ("Demo Supplier 04", "Demo Contact 04", "supplier04@example.com", "+91 00000 00014", "Sample business address 04", "New Delhi", "Delhi", "000000", None, 6, Decimal('4.75')),
            ("Demo Supplier 05", "Demo Contact 05", "supplier05@example.com", "+91 00000 00015", "Sample business address 05", "Bengaluru", "Karnataka", "000000", None, 8, Decimal('4.50')),
            ("Demo Supplier 06", "Demo Contact 06", "supplier06@example.com", "+91 00000 00016", "Sample business address 06", "Bengaluru", "Karnataka", "000000", None, 5, Decimal('4.65')),
            ("Demo Supplier 07", "Demo Contact 07", "supplier07@example.com", "+91 00000 00017", "Sample business address 07", "Mumbai", "Maharashtra", "000000", None, 4, Decimal('4.85')),
            ("Demo Supplier 08", "Demo Contact 08", "supplier08@example.com", "+91 00000 00018", "Sample business address 08", "Meerut", "Uttar Pradesh", "000000", None, 9, Decimal('4.40')),
            ("Demo Supplier 09", "Demo Contact 09", "supplier09@example.com", "+91 00000 00019", "Sample business address 09", "Kolkata", "West Bengal", "000000", None, 3, Decimal('4.70')),
            ("Demo Supplier 10", "Demo Contact 10", "supplier10@example.com", "+91 00000 00020", "Sample business address 10", "New Delhi", "Delhi", "000000", None, 10, Decimal('4.30')),
            ("Demo Supplier 11", "Demo Contact 11", "supplier11@example.com", "+91 00000 00021", "Sample business address 11", "Mumbai", "Maharashtra", "000000", None, 6, Decimal('4.55')),
            ("Demo Supplier 12", "Demo Contact 12", "supplier12@example.com", "+91 00000 00022", "Sample business address 12", "Jaipur", "Rajasthan", "000000", None, 14, Decimal('3.20')),
        ]
        sup_map = {}
        for sname, contact, email, phone, addr, city, state, pin, gstin, lead, rating in suppliers_data:
            sup, _ = Supplier.objects.get_or_create(
                email=email,
                defaults={
                    'name': sname, 'contact_person': contact, 'phone': phone,
                    'address': addr, 'city': city, 'state': state, 'pincode': pin,
                    'gstin': gstin, 'lead_time_days': lead, 'rating': rating
                }
            )
            sup_map[sname] = sup

        # 5. Locations
        locations_data = [
            ("Demo Warehouse 01", "WH-BHIW-01", Location.WAREHOUSE, "Sample warehouse address 01", "Bhiwandi", "Maharashtra", "000000", "+91 00000 00031", "Demo Manager 01"),
            ("Demo Warehouse 02", "WH-GUR-01", Location.WAREHOUSE, "Sample warehouse address 02", "Gurugram", "Haryana", "000000", "+91 00000 00032", "Demo Manager 02"),
            ("Demo Warehouse 03", "WH-BLR-01", Location.WAREHOUSE, "Sample warehouse address 03", "Bengaluru", "Karnataka", "000000", "+91 00000 00033", "Demo Manager 03"),
            ("Demo Warehouse 04", "WH-KOL-01", Location.WAREHOUSE, "Sample warehouse address 04", "Hooghly", "West Bengal", "000000", "+91 00000 00034", "Demo Manager 04"),
            ("Demo Store 01", "STR-MUM-01", Location.STORE, "Sample store address 01", "Mumbai", "Maharashtra", "000000", "+91 00000 00035", "Demo Manager 05"),
            ("Demo Store 02", "STR-DEL-01", Location.STORE, "Sample store address 02", "New Delhi", "Delhi", "000000", "+91 00000 00036", "Demo Manager 06"),
            ("Demo Store 03", "STR-BLR-01", Location.STORE, "Sample store address 03", "Bengaluru", "Karnataka", "000000", "+91 00000 00037", "Demo Manager 07"),
            ("Demo Store 04", "STR-CHE-01", Location.STORE, "Sample store address 04", "Chennai", "Tamil Nadu", "000000", "+91 00000 00038", "Demo Manager 08"),
            ("Demo Store 05", "STR-HYD-01", Location.STORE, "Sample store address 05", "Hyderabad", "Telangana", "000000", "+91 00000 00039", "Demo Manager 09"),
        ]
        loc_map = {}
        for lname, lcode, ltype, addr, city, state, pin, phone, mgr in locations_data:
            loc, _ = Location.objects.get_or_create(
                code=lcode,
                defaults={
                    'name': lname, 'location_type': ltype, 'address': addr,
                    'city': city, 'state': state, 'pincode': pin, 'contact_phone': phone,
                    'manager_name': mgr
                }
            )
            loc_map[lcode] = loc

        # 6. Products
        products_data = [
            ("SKU-ELEC-BOAT-A450", "boAt Airdopes 450 TWS Wireless Earbuds", "CAT-MOB", "Demo Supplier 04", "Bluetooth 5.2 earbuds with 42h playback and ASAP fast charge", "piece", Decimal('1199.00'), Decimal('1999.00'), 25, 10, "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500", Product.ACTIVE),
            ("SKU-ELEC-HAV-IR10", "Havells Dor 1100W Heavyweight Dry Iron", "CAT-ELEC", "Demo Supplier 01", "Heavyweight dry iron with American Teflon coating", "piece", Decimal('850.00'), Decimal('1349.00'), 15, 5, "https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=500", Product.ACTIVE),
            ("SKU-FASH-RAY-SH01", "Raymond Men Formal Slim Fit Cotton Shirt", "CAT-MEN", "Demo Supplier 03", "100% Giza cotton long-sleeve premium formal shirt", "piece", Decimal('1250.00'), Decimal('2499.00'), 20, 8, "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500", Product.ACTIVE),
            ("SKU-FASH-FAB-KU01", "FabIndia Handloom Tussar Silk Kurti", "CAT-WOMEN", "Demo Supplier 10", "Artisan-crafted women silk festive kurti with zari border", "piece", Decimal('1800.00'), Decimal('3590.00'), 12, 4, "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500", Product.ACTIVE),
            ("SKU-GROC-TATA-TEA", "Tata Tea Gold Leaf Pouch 1kg", "CAT-GROC", "Demo Supplier 02", "Fine tea blend with gently rolled long leaves", "kg", Decimal('420.00'), Decimal('560.00'), 50, 20, "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500", Product.ACTIVE),
            ("SKU-HOME-PRES-CK05", "Prestige Deluxe Alpha Stainless Steel Cooker 5L", "CAT-HOME", "Demo Supplier 05", "Induction base heavy-gauge stainless steel pressure cooker", "piece", Decimal('2100.00'), Decimal('3150.00'), 15, 6, "https://images.unsplash.com/photo-1584990347449-34b54b1d62c9?w=500", Product.ACTIVE),
            ("SKU-HLTH-HIM-FW01", "Himalaya Purifying Neem Face Wash 400ml", "CAT-HLTH", "Demo Supplier 06", "Herbal formulation with Neem and Turmeric to clear pores", "piece", Decimal('240.00'), Decimal('375.00'), 40, 15, "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500", Product.ACTIVE),
            ("SKU-SPRT-SG-BAT01", "SG Savage English Willow Cricket Bat Full Size", "CAT-SPRT", "Demo Supplier 08", "Grade 1 English willow cricket bat with thick power edges", "piece", Decimal('6200.00'), Decimal('10499.00'), 8, 3, "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=500", Product.ACTIVE),
            ("SKU-STAT-ITC-NB06", "Classmate Spiral Bound Notebook A4 Pack of 6", "CAT-STAT", "Demo Supplier 09", "300 pages chlorine-free eco-friendly smooth notebooks", "box", Decimal('390.00'), Decimal('600.00'), 30, 10, "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500", Product.ACTIVE),
            ("SKU-HOME-MIL-BOT1", "Milton Thermosteel Flip Lid Flask 1000ml", "CAT-HOME", "Demo Supplier 11", "Double-walled vacuum insulated flask keeping hot/cold 24 hours", "piece", Decimal('680.00'), Decimal('1099.00'), 35, 12, "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500", Product.ACTIVE),
            ("SKU-ELEC-BOAT-SPK1", "boAt Stone 650 10W Bluetooth Speaker", "CAT-ELEC", "Demo Supplier 04", "IPX6 water-resistant speaker with 7 hours battery life", "piece", Decimal('1100.00'), Decimal('1899.00'), 20, 8, "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=500", Product.ACTIVE),
            ("SKU-HLTH-GOD-SOAP", "Godrej Cinthol Original Deodorant Soap Pack of 6", "CAT-HLTH", "Demo Supplier 07", "Germ protection bath soap with cooling fragrance", "box", Decimal('180.00'), Decimal('270.00'), 50, 20, "https://images.unsplash.com/photo-1607006314184-7a353d25686d?w=500", Product.ACTIVE),
            ("SKU-COMP-LOGI-KB01", "Wireless Multi-Device Keyboard K380 Compact", "CAT-COMP", "Demo Supplier 04", "Bluetooth multi-device keyboard for Windows, Mac, iPad", "piece", Decimal('1950.00'), Decimal('2995.00'), 15, 5, "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500", Product.ACTIVE),
            ("SKU-ELEC-BOAT-A450-V1", "boAt Airdopes 450 (Legacy Edition)", "CAT-MOB", "Demo Supplier 04", "Discontinued first-generation earbuds line", "piece", Decimal('999.00'), Decimal('1499.00'), 0, 0, None, Product.DISCONTINUED),
        ]
        prod_map = {}
        for sku, pname, cat_code, sname, desc, uom, cost, price, reorder, safety, img, status in products_data:
            p, _ = Product.objects.get_or_create(
                sku=sku,
                defaults={
                    'name': pname, 'category': cat_map[cat_code], 'supplier': sup_map.get(sname),
                    'description': desc, 'unit_of_measure': uom, 'cost_price': cost,
                    'selling_price': price, 'reorder_point': reorder, 'safety_stock': safety,
                    'image_url': img, 'status': status
                }
            )
            prod_map[sku] = p

        # 7. Inventory Items (Stock levels across locations)
        stock_configs = [
            # Bhiwandi WH
            (loc_map["WH-BHIW-01"], "SKU-ELEC-BOAT-A450", 350, 15, "Aisle-A1-S01"),
            (loc_map["WH-BHIW-01"], "SKU-ELEC-HAV-IR10", 120, 5, "Aisle-A1-S02"),
            (loc_map["WH-BHIW-01"], "SKU-FASH-RAY-SH01", 240, 20, "Aisle-B2-S01"),
            (loc_map["WH-BHIW-01"], "SKU-FASH-FAB-KU01", 80, 8, "Aisle-B2-S02"),
            (loc_map["WH-BHIW-01"], "SKU-GROC-TATA-TEA", 600, 50, "Aisle-C3-S01"),
            (loc_map["WH-BHIW-01"], "SKU-HOME-PRES-CK05", 110, 10, "Aisle-D4-S01"),
            (loc_map["WH-BHIW-01"], "SKU-HLTH-HIM-FW01", 450, 25, "Aisle-E5-S01"),
            (loc_map["WH-BHIW-01"], "SKU-SPRT-SG-BAT01", 40, 4, "Aisle-F6-S01"),
            (loc_map["WH-BHIW-01"], "SKU-STAT-ITC-NB06", 280, 30, "Aisle-G7-S01"),
            (loc_map["WH-BHIW-01"], "SKU-HOME-MIL-BOT1", 210, 15, "Aisle-D4-S02"),
            (loc_map["WH-BHIW-01"], "SKU-COMP-LOGI-KB01", 95, 6, "Aisle-A2-S01"),
            # Gurugram WH
            (loc_map["WH-GUR-01"], "SKU-ELEC-BOAT-A450", 420, 30, "Aisle-G1-01"),
            (loc_map["WH-GUR-01"], "SKU-ELEC-HAV-IR10", 150, 12, "Aisle-G1-02"),
            (loc_map["WH-GUR-01"], "SKU-FASH-RAY-SH01", 190, 10, "Aisle-G2-01"),
            (loc_map["WH-GUR-01"], "SKU-GROC-TATA-TEA", 500, 35, "Aisle-G3-01"),
            (loc_map["WH-GUR-01"], "SKU-COMP-LOGI-KB01", 85, 4, "Aisle-G1-04"),
            # Whitefield WH
            (loc_map["WH-BLR-01"], "SKU-ELEC-BOAT-A450", 300, 20, "Rack-W1-01"),
            (loc_map["WH-BLR-01"], "SKU-FASH-RAY-SH01", 160, 15, "Rack-W2-01"),
            (loc_map["WH-BLR-01"], "SKU-GROC-TATA-TEA", 400, 40, "Rack-W3-01"),
            # Bandra Store
            (loc_map["STR-MUM-01"], "SKU-ELEC-BOAT-A450", 28, 2, "Shelf-E01"),
            (loc_map["STR-MUM-01"], "SKU-ELEC-HAV-IR10", 14, 1, "Shelf-H02"),
            (loc_map["STR-MUM-01"], "SKU-FASH-RAY-SH01", 35, 3, "Rack-F01"),
            (loc_map["STR-MUM-01"], "SKU-HOME-PRES-CK05", 12, 1, "Home-K01"),
            (loc_map["STR-MUM-01"], "SKU-COMP-LOGI-KB01", 15, 2, "Shelf-E03"),
            # Connaught Place Store
            (loc_map["STR-DEL-01"], "SKU-ELEC-BOAT-A450", 32, 4, "Store-A1"),
            (loc_map["STR-DEL-01"], "SKU-FASH-RAY-SH01", 40, 5, "Store-B1"),
            (loc_map["STR-DEL-01"], "SKU-HOME-PRES-CK05", 8, 0, "Store-C1"),
            (loc_map["STR-DEL-01"], "SKU-SPRT-SG-BAT01", 5, 1, "Store-D1"),
        ]
        for loc, sku, q_on_hand, q_res, aisle in stock_configs:
            InventoryItem.objects.update_or_create(
                location=loc,
                product=prod_map[sku],
                defaults={
                    'quantity_on_hand': q_on_hand,
                    'quantity_reserved': q_res,
                    'aisle_shelf': aisle,
                    'last_stock_take_at': timezone.now()
                }
            )

        # 8. Customers
        customers_data = [
            ("Demo Customer 01", "customer01@example.com", "+91 00000 00101", "Sample address 01", "Mumbai", "Maharashtra", "000000"),
            ("Demo Customer 02", "customer02@example.com", "+91 00000 00102", "Sample address 02", "Kolkata", "West Bengal", "000000"),
            ("Demo Customer 03", "customer03@example.com", "+91 00000 00103", "Sample address 03", "Chennai", "Tamil Nadu", "000000"),
            ("Demo Customer 04", "customer04@example.com", "+91 00000 00104", "Sample address 04", "New Delhi", "Delhi", "000000"),
            ("Demo Customer 05", "customer05@example.com", "+91 00000 00105", "Sample address 05", "Bengaluru", "Karnataka", "000000"),
            ("Demo Customer 06", "customer06@example.com", "+91 00000 00106", "Sample address 06", "Gurugram", "Haryana", "000000"),
            ("Demo Customer 07", "customer07@example.com", "+91 00000 00107", "Sample address 07", "Jaipur", "Rajasthan", "000000"),
        ]
        cust_list = []
        for cname, cemail, cphone, caddr, ccity, cstate, cpin in customers_data:
            c, _ = Customer.objects.get_or_create(
                phone=cphone,
                defaults={'name': cname, 'email': cemail, 'address': caddr, 'city': ccity, 'state': cstate, 'pincode': cpin}
            )
            cust_list.append(c)

        # 9. Orders & Order Items
        orders_data = [
            ("ORD-2024-001", cust_list[0], loc_map["STR-MUM-01"], Order.DELIVERED, Order.PAYMENT_PAID, Order.METHOD_UPI, [("SKU-ELEC-BOAT-A450", 1, Decimal('1999.00')), ("SKU-FASH-RAY-SH01", 1, Decimal('2499.00'))]),
            ("ORD-2024-002", cust_list[3], loc_map["STR-DEL-01"], Order.DELIVERED, Order.PAYMENT_PAID, Order.METHOD_CREDIT, [("SKU-SPRT-SG-BAT01", 1, Decimal('10499.00')), ("SKU-HOME-MIL-BOT1", 1, Decimal('1099.00'))]),
            ("ORD-2024-003", cust_list[4], loc_map["STR-BLR-01"], Order.DELIVERED, Order.PAYMENT_PAID, Order.METHOD_UPI, [("SKU-COMP-LOGI-KB01", 1, Decimal('2995.00'))]),
            ("ORD-2024-004", cust_list[2], loc_map["STR-CHE-01"], Order.DELIVERED, Order.PAYMENT_PAID, Order.METHOD_DEBIT, [("SKU-HOME-PRES-CK05", 1, Decimal('3150.00'))]),
            ("ORD-2024-005", cust_list[5], loc_map["STR-DEL-01"], Order.DELIVERED, Order.PAYMENT_PAID, Order.METHOD_CREDIT, [("SKU-FASH-RAY-SH01", 2, Decimal('2499.00')), ("SKU-SPRT-SG-BAT01", 1, Decimal('10495.00'))]),
            ("ORD-2024-006", cust_list[1], loc_map["STR-MUM-01"], Order.SHIPPED, Order.PAYMENT_PAID, Order.METHOD_UPI, [("SKU-ELEC-BOAT-A450", 1, Decimal('1999.00'))]),
            ("ORD-2024-007", cust_list[6], loc_map["STR-MUM-01"], Order.PROCESSING, Order.PAYMENT_PAID, Order.METHOD_UPI, [("SKU-FASH-FAB-KU01", 1, Decimal('3590.00'))]),
            ("ORD-2024-008", cust_list[0], loc_map["STR-DEL-01"], Order.PENDING, Order.PAYMENT_PENDING, Order.METHOD_UPI, [("SKU-ELEC-BOAT-SPK1", 1, Decimal('1899.00'))]),
        ]
        for onum, cust, loc, status, pay_status, pay_method, items in orders_data:
            ord_obj, created = Order.objects.get_or_create(
                order_number=onum,
                defaults={
                    'customer': cust, 'location': loc, 'status': status,
                    'payment_status': pay_status, 'payment_method': pay_method,
                }
            )
            if created:
                total = Decimal('0.00')
                for p_sku, qty, price in items:
                    sub = Decimal(qty) * price
                    OrderItem.objects.create(
                        order=ord_obj, product=prod_map[p_sku],
                        quantity=qty, unit_price=price, subtotal=sub
                    )
                    total += sub
                ord_obj.total_amount = total
                ord_obj.save(update_fields=['total_amount'])

        # 10. Purchase Orders
        po_data = [
            ("PO-2024-001", sup_map["boAt Lifestyle Electronics"], loc_map["WH-BHIW-01"], PurchaseOrder.RECEIVED, [("SKU-ELEC-BOAT-A450", 200, Decimal('1199.00'))]),
            ("PO-2024-002", sup_map["Tata Consumer Products Ltd"], loc_map["WH-BHIW-01"], PurchaseOrder.RECEIVED, [("SKU-GROC-TATA-TEA", 400, Decimal('420.00'))]),
            ("PO-2024-003", sup_map["Havells India Supply Corp"], loc_map["WH-GUR-01"], PurchaseOrder.RECEIVED, [("SKU-ELEC-HAV-IR10", 150, Decimal('850.00'))]),
            ("PO-2024-004", sup_map["boAt Lifestyle Electronics"], loc_map["WH-GUR-01"], PurchaseOrder.ORDERED, [("SKU-ELEC-BOAT-A450", 200, Decimal('1199.00'))]),
            ("PO-2024-005", sup_map["Raymond Textile Mills Ltd"], loc_map["WH-BHIW-01"], PurchaseOrder.DRAFT, [("SKU-FASH-RAY-SH01", 100, Decimal('1250.00'))]),
        ]
        for ponum, sup, dest, status, items in po_data:
            po, created = PurchaseOrder.objects.get_or_create(
                po_number=ponum,
                defaults={
                    'supplier': sup, 'destination_location': dest, 'status': status,
                    'created_by': admin_user,
                    'actual_delivery_date': timezone.now() if status == PurchaseOrder.RECEIVED else None
                }
            )
            if created:
                total = Decimal('0.00')
                for p_sku, qty, cost in items:
                    sub = Decimal(qty) * cost
                    PurchaseOrderItem.objects.create(
                        purchase_order=po, product=prod_map[p_sku],
                        quantity_ordered=qty, quantity_received=qty if status == PurchaseOrder.RECEIVED else 0,
                        unit_cost=cost, subtotal=sub
                    )
                    total += sub
                po.total_amount = total
                po.save(update_fields=['total_amount'])

        # 11. Stock Transfers
        trf, created = StockTransfer.objects.get_or_create(
            transfer_number="TRF-2024-001",
            defaults={
                'from_location': loc_map["WH-BHIW-01"],
                'to_location': loc_map["STR-MUM-01"],
                'status': StockTransfer.COMPLETED,
                'initiated_by': admin_user,
                'completed_date': timezone.now(),
                'notes': "Replenishment for Bandra Retail Store"
            }
        )
        if created:
            StockTransferItem.objects.create(transfer=trf, product=prod_map["SKU-ELEC-BOAT-A450"], quantity=20, received_quantity=20)

        # 12. Stock Adjustments
        StockAdjustment.objects.get_or_create(
            adjustment_number="ADJ-2024-001",
            defaults={
                'location': loc_map["WH-BHIW-01"],
                'product': prod_map["SKU-ELEC-BOAT-A450"],
                'previous_quantity': 352,
                'adjusted_quantity': 350,
                'difference': -2,
                'reason': StockAdjustment.REASON_DAMAGE,
                'adjusted_by': admin_user,
                'notes': "Two boxes crushed during warehouse pallet transit"
            }
        )

        self.stdout.write(self.style.SUCCESS("Successfully seeded StockSmart database!"))
