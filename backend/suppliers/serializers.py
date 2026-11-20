from rest_framework import serializers
from suppliers.models import Supplier, PurchaseOrder, PurchaseOrderItem
from products.models import Product

class SupplierSerializer(serializers.ModelSerializer):
    total_pos = serializers.IntegerField(source='purchase_orders.count', read_only=True)

    class Meta:
        model = Supplier
        fields = [
            'id', 'name', 'contact_person', 'email', 'phone', 'address',
            'city', 'state', 'pincode', 'gstin', 'lead_time_days', 'rating',
            'is_active', 'total_pos', 'created_at'
        ]


class PurchaseOrderItemSerializer(serializers.ModelSerializer):
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = PurchaseOrderItem
        fields = ['id', 'product', 'product_sku', 'product_name', 'quantity_ordered', 'quantity_received', 'unit_cost', 'subtotal']
        read_only_fields = ['subtotal']


class PurchaseOrderSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    destination_name = serializers.CharField(source='destination_location.name', read_only=True)
    destination_code = serializers.CharField(source='destination_location.code', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    items = PurchaseOrderItemSerializer(many=True, required=False)

    class Meta:
        model = PurchaseOrder
        fields = [
            'id', 'po_number', 'supplier', 'supplier_name', 'destination_location',
            'destination_name', 'destination_code', 'status', 'total_amount',
            'order_date', 'expected_delivery_date', 'actual_delivery_date',
            'created_by', 'created_by_username', 'notes', 'items'
        ]
        read_only_fields = ['total_amount', 'order_date', 'created_by']

    def create(self, validated_data):
        items_data = self.context['request'].data.get('items', [])
        po = PurchaseOrder.objects.create(**validated_data)
        total = 0
        for it in items_data:
            p = Product.objects.get(id=it['product'])
            cost = it.get('unit_cost', p.cost_price)
            qty = int(it['quantity_ordered'])
            sub = qty * cost
            PurchaseOrderItem.objects.create(
                purchase_order=po,
                product=p,
                quantity_ordered=qty,
                quantity_received=0,
                unit_cost=cost,
                subtotal=sub
            )
            total += sub
        po.total_amount = total
        po.save(update_fields=['total_amount'])
        return po
