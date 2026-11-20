import pytest
from decimal import Decimal
from django.core.management import call_command
from django.core.management.base import CommandError
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from users.models import Role
from products.models import Category, Product
from inventory.models import Location, InventoryItem, StockTransfer, StockTransferItem, StockAdjustment
from suppliers.models import Supplier, PurchaseOrder, PurchaseOrderItem
from orders.models import Customer, Order, OrderItem
from stocksmart.services import InventoryService, AnalyticsService

User = get_user_model()

def test_seed_command_requires_explicit_password(monkeypatch):
    monkeypatch.delenv("STOCKSMART_SEED_PASSWORD", raising=False)
    with pytest.raises(CommandError, match="STOCKSMART_SEED_PASSWORD"):
        call_command("seed_data")

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def setup_data(db):
    admin_role = Role.objects.create(name=Role.ADMIN, description="Admin")
    admin_user = User.objects.create_user(
        username="testadmin", email="admin@test.com", password="password123", role=admin_role
    )
    
    cat = Category.objects.create(name="Electronics", code="ELEC")
    sup = Supplier.objects.create(
        name="Demo Supplier", contact_person="Demo Contact", email="supplier@example.com",
        phone="+91 00000 00001", address="Sample business address", city="Mumbai", state="Maharashtra", pincode="000000"
    )
    prod = Product.objects.create(
        sku="SKU-TEST-001", name="Wireless Headphone", category=cat, supplier=sup,
        cost_price=Decimal("1000.00"), selling_price=Decimal("1500.00"),
        reorder_point=10, safety_stock=5
    )
    
    wh = Location.objects.create(
        name="Main Hub", code="WH-01", location_type=Location.WAREHOUSE,
        address="Sample warehouse address", city="Mumbai", state="Maharashtra", pincode="000000",
        contact_phone="+91 00000 00002", manager_name="Demo Manager"
    )
    store = Location.objects.create(
        name="Retail Store 1", code="STR-01", location_type=Location.STORE,
        address="Sample store address", city="Mumbai", state="Maharashtra", pincode="000000",
        contact_phone="+91 00000 00003", manager_name="Demo Manager"
    )

    inv = InventoryItem.objects.create(
        product=prod, location=wh, quantity_on_hand=100, quantity_reserved=10
    )

    cust = Customer.objects.create(
        name="Demo Customer", email="customer@example.com", phone="+91 00000 00004",
        city="Mumbai", state="Maharashtra"
    )

    return {
        'admin_user': admin_user,
        'category': cat,
        'supplier': sup,
        'product': prod,
        'wh': wh,
        'store': store,
        'inventory': inv,
        'customer': cust
    }

@pytest.mark.django_db
def test_health_check(api_client):
    response = api_client.get('/api/health/')
    assert response.status_code == status.HTTP_200_OK
    assert response.json()['status'] == 'ok'

@pytest.mark.django_db
def test_auth_login(api_client, setup_data):
    response = api_client.post('/api/auth/login/', {
        'username': 'testadmin',
        'password': 'password123'
    })
    assert response.status_code == status.HTTP_200_OK
    assert 'access' in response.data
    assert response.data['user']['username'] == 'testadmin'

@pytest.mark.django_db
def test_products_list(api_client, setup_data):
    api_client.force_authenticate(user=setup_data['admin_user'])
    response = api_client.get('/api/products/')
    assert response.status_code == status.HTTP_200_OK
    assert response.data['count'] >= 1

@pytest.mark.django_db
def test_order_fulfillment_deducts_stock(setup_data):
    wh = setup_data['wh']
    prod = setup_data['product']
    inv = setup_data['inventory']

    assert inv.quantity_on_hand == 100

    order = Order.objects.create(
        order_number="ORD-TEST-001",
        customer=setup_data['customer'],
        location=wh,
        status=Order.PENDING,
        total_amount=Decimal("3000.00")
    )
    OrderItem.objects.create(
        order=order, product=prod, quantity=5, unit_price=Decimal("1500.00"), subtotal=Decimal("7500.00")
    )

    # Process fulfillment
    InventoryService.process_order_fulfillment(order)
    inv.refresh_from_db()
    assert inv.quantity_on_hand == 95

@pytest.mark.django_db
def test_purchase_order_receipt_adds_stock(setup_data):
    wh = setup_data['wh']
    prod = setup_data['product']
    sup = setup_data['supplier']
    inv = setup_data['inventory']

    po = PurchaseOrder.objects.create(
        po_number="PO-TEST-001",
        supplier=sup,
        destination_location=wh,
        status=PurchaseOrder.ORDERED,
        total_amount=Decimal("50000.00")
    )
    PurchaseOrderItem.objects.create(
        purchase_order=po, product=prod, quantity_ordered=50, unit_cost=Decimal("1000.00"), subtotal=Decimal("50000.00")
    )

    InventoryService.receive_purchase_order(po)
    inv.refresh_from_db()
    po.refresh_from_db()

    assert inv.quantity_on_hand == 150
    assert po.status == PurchaseOrder.RECEIVED

@pytest.mark.django_db
def test_stock_transfer_between_locations(setup_data):
    wh = setup_data['wh']
    store = setup_data['store']
    prod = setup_data['product']

    transfer = StockTransfer.objects.create(
        transfer_number="TRF-TEST-001",
        from_location=wh,
        to_location=store,
        status=StockTransfer.PENDING
    )
    StockTransferItem.objects.create(
        transfer=transfer, product=prod, quantity=20
    )

    InventoryService.complete_stock_transfer(transfer)

    src_inv = InventoryItem.objects.get(product=prod, location=wh)
    dest_inv = InventoryItem.objects.get(product=prod, location=store)

    assert src_inv.quantity_on_hand == 80
    assert dest_inv.quantity_on_hand == 20
    assert transfer.status == StockTransfer.COMPLETED

@pytest.mark.django_db
def test_analytics_kpi(api_client, setup_data):
    api_client.force_authenticate(user=setup_data['admin_user'])
    response = api_client.get('/api/analytics/kpis/')
    assert response.status_code == status.HTTP_200_OK
    assert 'total_inventory_valuation' in response.data
    assert response.data['total_skus'] >= 1
