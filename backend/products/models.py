from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True, null=True)
    parent_category = models.ForeignKey(
        'self', on_delete=models.SET_NULL, null=True, blank=True, related_name='subcategories'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'categories'
        verbose_name_plural = 'Categories'
        ordering = ['name']

    def __str__(self):
        return self.name


class Product(models.Model):
    ACTIVE = 'ACTIVE'
    DISCONTINUED = 'DISCONTINUED'
    OUT_OF_STOCK = 'OUT_OF_STOCK'

    STATUS_CHOICES = (
        (ACTIVE, 'Active'),
        (DISCONTINUED, 'Discontinued'),
        (OUT_OF_STOCK, 'Out of Stock'),
    )

    sku = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=255)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='products')
    supplier = models.ForeignKey(
        'suppliers.Supplier', on_delete=models.SET_NULL, null=True, blank=True, related_name='products'
    )
    description = models.TextField(blank=True, null=True)
    unit_of_measure = models.CharField(max_length=30, default='piece')
    cost_price = models.DecimalField(max_digits=12, decimal_places=2)
    selling_price = models.DecimalField(max_digits=12, decimal_places=2)
    reorder_point = models.PositiveIntegerField(default=10)
    safety_stock = models.PositiveIntegerField(default=5)
    image_url = models.URLField(max_length=500, blank=True, null=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default=ACTIVE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'products'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} [{self.sku}]"

    @property
    def total_stock(self):
        from inventory.models import InventoryItem
        return sum(item.quantity_on_hand for item in self.inventory_items.all())

    @property
    def is_low_stock(self):
        return self.total_stock <= self.reorder_point
