from rest_framework import serializers
from orders.models import Customer, Order, OrderItem
from products.models import Product

class CustomerSerializer(serializers.ModelSerializer):
    orders_count = serializers.IntegerField(source='orders.count', read_only=True)

    class Meta:
        model = Customer
        fields = ['id', 'name', 'email', 'phone', 'address', 'city', 'state', 'pincode', 'orders_count', 'created_at']


class OrderItemSerializer(serializers.ModelSerializer):
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_sku', 'product_name', 'quantity', 'unit_price', 'subtotal']
        read_only_fields = ['subtotal']


class OrderSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    customer_phone = serializers.CharField(source='customer.phone', read_only=True)
    location_name = serializers.CharField(source='location.name', read_only=True)
    location_code = serializers.CharField(source='location.code', read_only=True)
    items = OrderItemSerializer(many=True, required=False)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'customer', 'customer_name', 'customer_phone',
            'location', 'location_name', 'location_code', 'status', 'total_amount',
            'payment_status', 'payment_method', 'order_date', 'shipped_date',
            'delivery_date', 'notes', 'items'
        ]
        read_only_fields = ['total_amount', 'order_date']

    def create(self, validated_data):
        items_data = self.context['request'].data.get('items', [])
        order = Order.objects.create(**validated_data)
        total = 0
        for it in items_data:
            p = Product.objects.get(id=it['product'])
            price = it.get('unit_price', p.selling_price)
            qty = int(it['quantity'])
            sub = qty * price
            OrderItem.objects.create(
                order=order, product=p, quantity=qty, unit_price=price, subtotal=sub
            )
            total += sub
        order.total_amount = total
        order.save(update_fields=['total_amount'])
        return order
