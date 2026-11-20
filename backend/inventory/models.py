from django.db import models
from django.conf import settings

class Location(models.Model):
    WAREHOUSE = 'WAREHOUSE'
    STORE = 'STORE'

    LOCATION_TYPE_CHOICES = (
        (WAREHOUSE, 'Warehouse'),
        (STORE, 'Retail Store'),
    )

    name = models.CharField(max_length=150)
    code = models.CharField(max_length=50, unique=True)
    location_type = models.CharField(max_length=30, choices=LOCATION_TYPE_CHOICES)
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10)
    contact_phone = models.CharField(max_length=20)
    manager_name = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'locations'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.code} - {self.location_type})"


class InventoryItem(models.Model):
    product = models.ForeignKey('products.Product', on_delete=models.CASCADE, related_name='inventory_items')
    location = models.ForeignKey(Location, on_delete=models.CASCADE, related_name='inventory_items')
    quantity_on_hand = models.IntegerField(default=0)
    quantity_reserved = models.IntegerField(default=0)
    aisle_shelf = models.CharField(max_length=50, blank=True, null=True)
    last_stock_take_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'inventory_items'
        unique_together = ('product', 'location')
        ordering = ['location', 'product']

    def __str__(self):
        return f"{self.product.sku} @ {self.location.code}: {self.quantity_on_hand} units"

    @property
    def quantity_available(self):
        return max(0, self.quantity_on_hand - self.quantity_reserved)


class StockTransfer(models.Model):
    PENDING = 'PENDING'
    IN_TRANSIT = 'IN_TRANSIT'
    COMPLETED = 'COMPLETED'
    CANCELLED = 'CANCELLED'

    STATUS_CHOICES = (
        (PENDING, 'Pending'),
        (IN_TRANSIT, 'In Transit'),
        (COMPLETED, 'Completed'),
        (CANCELLED, 'Cancelled'),
    )

    transfer_number = models.CharField(max_length=50, unique=True)
    from_location = models.ForeignKey(Location, on_delete=models.PROTECT, related_name='transfers_out')
    to_location = models.ForeignKey(Location, on_delete=models.PROTECT, related_name='transfers_in')
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default=PENDING)
    initiated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='initiated_transfers'
    )
    transfer_date = models.DateTimeField(auto_now_add=True)
    completed_date = models.DateTimeField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'stock_transfers'
        ordering = ['-transfer_date']

    def __str__(self):
        return f"{self.transfer_number}: {self.from_location.code} -> {self.to_location.code} ({self.status})"


class StockTransferItem(models.Model):
    transfer = models.ForeignKey(StockTransfer, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey('products.Product', on_delete=models.PROTECT, related_name='transfer_items')
    quantity = models.PositiveIntegerField()
    received_quantity = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'stock_transfer_items'

    def __str__(self):
        return f"{self.product.sku} x {self.quantity}"


class StockAdjustment(models.Model):
    REASON_DAMAGE = 'DAMAGE'
    REASON_EXPIRY = 'EXPIRY'
    REASON_AUDIT = 'AUDIT_DISCREPANCY'
    REASON_RETURN = 'RETURN'
    REASON_OTHER = 'OTHER'

    REASON_CHOICES = (
        (REASON_DAMAGE, 'Damage / Breakage'),
        (REASON_EXPIRY, 'Expiry / Obsolete'),
        (REASON_AUDIT, 'Audit Discrepancy / Shrinkage'),
        (REASON_RETURN, 'Customer Return'),
        (REASON_OTHER, 'Other'),
    )

    adjustment_number = models.CharField(max_length=50, unique=True)
    location = models.ForeignKey(Location, on_delete=models.PROTECT, related_name='adjustments')
    product = models.ForeignKey('products.Product', on_delete=models.PROTECT, related_name='adjustments')
    previous_quantity = models.IntegerField()
    adjusted_quantity = models.IntegerField()
    difference = models.IntegerField()
    reason = models.CharField(max_length=50, choices=REASON_CHOICES)
    adjusted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='adjustments'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'stock_adjustments'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.adjustment_number} ({self.product.sku} diff: {self.difference:+d})"
