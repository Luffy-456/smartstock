from django.db import models
from django.conf import settings

class Supplier(models.Model):
    name = models.CharField(max_length=200)
    contact_person = models.CharField(max_length=100)
    email = models.EmailField(max_length=255, unique=True)
    phone = models.CharField(max_length=20)
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10)
    gstin = models.CharField(max_length=20, blank=True, null=True)
    lead_time_days = models.PositiveIntegerField(default=7)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=4.00)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'suppliers'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.city})"


class PurchaseOrder(models.Model):
    DRAFT = 'DRAFT'
    ORDERED = 'ORDERED'
    PARTIALLY_RECEIVED = 'PARTIALLY_RECEIVED'
    RECEIVED = 'RECEIVED'
    CANCELLED = 'CANCELLED'

    STATUS_CHOICES = (
        (DRAFT, 'Draft'),
        (ORDERED, 'Ordered'),
        (PARTIALLY_RECEIVED, 'Partially Received'),
        (RECEIVED, 'Received'),
        (CANCELLED, 'Cancelled'),
    )

    po_number = models.CharField(max_length=50, unique=True)
    supplier = models.ForeignKey(Supplier, on_delete=models.PROTECT, related_name='purchase_orders')
    destination_location = models.ForeignKey('inventory.Location', on_delete=models.PROTECT, related_name='purchase_orders')
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default=DRAFT)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    order_date = models.DateTimeField(auto_now_add=True)
    expected_delivery_date = models.DateField(blank=True, null=True)
    actual_delivery_date = models.DateTimeField(blank=True, null=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='purchase_orders')
    notes = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'purchase_orders'
        ordering = ['-order_date']

    def __str__(self):
        return f"{self.po_number} - {self.supplier.name} ({self.status})"

    def recalculate_total(self):
        total = sum(item.subtotal for item in self.items.all())
        self.total_amount = total
        self.save(update_fields=['total_amount'])


class PurchaseOrderItem(models.Model):
    purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey('products.Product', on_delete=models.PROTECT, related_name='po_items')
    quantity_ordered = models.PositiveIntegerField()
    quantity_received = models.PositiveIntegerField(default=0)
    unit_cost = models.DecimalField(max_digits=12, decimal_places=2)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        db_table = 'purchase_order_items'
        ordering = ['id']

    def save(self, *args, **kwargs):
        self.subtotal = self.quantity_ordered * self.unit_cost
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.product.sku} ({self.quantity_ordered} ordered)"
