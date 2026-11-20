from django.db import models

class Customer(models.Model):
    name = models.CharField(max_length=150)
    email = models.EmailField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=20)
    address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    pincode = models.CharField(max_length=10, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'customers'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.phone})"


class Order(models.Model):
    PENDING = 'PENDING'
    CONFIRMED = 'CONFIRMED'
    PROCESSING = 'PROCESSING'
    PACKED = 'PACKED'
    SHIPPED = 'SHIPPED'
    DELIVERED = 'DELIVERED'
    CANCELLED = 'CANCELLED'

    STATUS_CHOICES = (
        (PENDING, 'Pending'),
        (CONFIRMED, 'Confirmed'),
        (PROCESSING, 'Processing'),
        (PACKED, 'Packed'),
        (SHIPPED, 'Shipped'),
        (DELIVERED, 'Delivered'),
        (CANCELLED, 'Cancelled'),
    )

    PAYMENT_PENDING = 'PENDING'
    PAYMENT_PAID = 'PAID'
    PAYMENT_REFUNDED = 'REFUNDED'

    PAYMENT_STATUS_CHOICES = (
        (PAYMENT_PENDING, 'Pending'),
        (PAYMENT_PAID, 'Paid'),
        (PAYMENT_REFUNDED, 'Refunded'),
    )

    METHOD_UPI = 'UPI'
    METHOD_CREDIT = 'CREDIT_CARD'
    METHOD_DEBIT = 'DEBIT_CARD'
    METHOD_CASH = 'CASH'
    METHOD_NET_BANKING = 'NET_BANKING'

    PAYMENT_METHOD_CHOICES = (
        (METHOD_UPI, 'UPI / QR Code'),
        (METHOD_CREDIT, 'Credit Card'),
        (METHOD_DEBIT, 'Debit Card'),
        (METHOD_CASH, 'Cash on Delivery'),
        (METHOD_NET_BANKING, 'Net Banking'),
    )

    order_number = models.CharField(max_length=50, unique=True)
    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')
    location = models.ForeignKey('inventory.Location', on_delete=models.PROTECT, related_name='orders')
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default=PENDING)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    payment_status = models.CharField(max_length=30, choices=PAYMENT_STATUS_CHOICES, default=PAYMENT_PAID)
    payment_method = models.CharField(max_length=50, choices=PAYMENT_METHOD_CHOICES, default=METHOD_UPI)
    order_date = models.DateTimeField(auto_now_add=True)
    shipped_date = models.DateTimeField(blank=True, null=True)
    delivery_date = models.DateTimeField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'orders'
        ordering = ['-order_date']

    def __str__(self):
        cust_name = self.customer.name if self.customer else "Walk-in Customer"
        return f"{self.order_number} - {cust_name} ({self.status}) [INR {self.total_amount}]"

    def recalculate_total(self):
        total = sum(item.subtotal for item in self.items.all())
        self.total_amount = total
        self.save(update_fields=['total_amount'])


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey('products.Product', on_delete=models.PROTECT, related_name='order_items')
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        db_table = 'order_items'
        ordering = ['id']

    def save(self, *args, **kwargs):
        self.subtotal = self.quantity * self.unit_price
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.product.sku} x {self.quantity} (@ INR {self.unit_price})"
