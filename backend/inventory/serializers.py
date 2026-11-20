from rest_framework import serializers
from inventory.models import Location, InventoryItem, StockTransfer, StockTransferItem, StockAdjustment
from products.models import Product

class LocationSerializer(serializers.ModelSerializer):
    total_skus = serializers.SerializerMethodField()
    total_items = serializers.SerializerMethodField()

    class Meta:
        model = Location
        fields = [
            'id', 'name', 'code', 'location_type', 'address', 'city', 'state',
            'pincode', 'contact_phone', 'manager_name', 'is_active', 'total_skus',
            'total_items', 'created_at'
        ]

    def get_total_skus(self, obj):
        return obj.inventory_items.filter(quantity_on_hand__gt=0).count()

    def get_total_items(self, obj):
        return sum(item.quantity_on_hand for item in obj.inventory_items.all())


class InventoryItemSerializer(serializers.ModelSerializer):
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_category = serializers.CharField(source='product.category.name', read_only=True)
    product_cost_price = serializers.DecimalField(source='product.cost_price', max_digits=12, decimal_places=2, read_only=True)
    product_selling_price = serializers.DecimalField(source='product.selling_price', max_digits=12, decimal_places=2, read_only=True)
    location_name = serializers.CharField(source='location.name', read_only=True)
    location_code = serializers.CharField(source='location.code', read_only=True)
    location_type = serializers.CharField(source='location.location_type', read_only=True)
    quantity_available = serializers.IntegerField(read_only=True)

    class Meta:
        model = InventoryItem
        fields = [
            'id', 'product', 'product_sku', 'product_name', 'product_category',
            'product_cost_price', 'product_selling_price', 'location', 'location_name',
            'location_code', 'location_type', 'quantity_on_hand', 'quantity_reserved',
            'quantity_available', 'aisle_shelf', 'last_stock_take_at', 'updated_at'
        ]


class StockTransferItemSerializer(serializers.ModelSerializer):
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = StockTransferItem
        fields = ['id', 'product', 'product_sku', 'product_name', 'quantity', 'received_quantity']


class StockTransferSerializer(serializers.ModelSerializer):
    from_location_name = serializers.CharField(source='from_location.name', read_only=True)
    to_location_name = serializers.CharField(source='to_location.name', read_only=True)
    initiated_by_username = serializers.CharField(source='initiated_by.username', read_only=True)
    items = StockTransferItemSerializer(many=True, required=False)

    class Meta:
        model = StockTransfer
        fields = [
            'id', 'transfer_number', 'from_location', 'from_location_name',
            'to_location', 'to_location_name', 'status', 'initiated_by',
            'initiated_by_username', 'transfer_date', 'completed_date', 'notes', 'items'
        ]

    def create(self, validated_data):
        items_data = self.context['request'].data.get('items', [])
        transfer = StockTransfer.objects.create(**validated_data)
        for it in items_data:
            StockTransferItem.objects.create(
                transfer=transfer,
                product_id=it['product'],
                quantity=it['quantity']
            )
        return transfer


class StockAdjustmentSerializer(serializers.ModelSerializer):
    location_name = serializers.CharField(source='location.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    adjusted_by_username = serializers.CharField(source='adjusted_by.username', read_only=True)

    class Meta:
        model = StockAdjustment
        fields = [
            'id', 'adjustment_number', 'location', 'location_name', 'product',
            'product_sku', 'product_name', 'previous_quantity', 'adjusted_quantity',
            'difference', 'reason', 'adjusted_by', 'adjusted_by_username', 'created_at', 'notes'
        ]
        read_only_fields = ['id', 'adjustment_number', 'previous_quantity', 'difference', 'adjusted_by', 'created_at']
