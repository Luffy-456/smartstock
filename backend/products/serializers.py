from rest_framework import serializers
from products.models import Category, Product
from inventory.models import InventoryItem

class CategorySerializer(serializers.ModelSerializer):
    subcategories_count = serializers.IntegerField(source='subcategories.count', read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'code', 'description', 'parent_category', 'subcategories_count', 'created_at']


class InventorySummarySerializer(serializers.ModelSerializer):
    location_name = serializers.CharField(source='location.name', read_only=True)
    location_code = serializers.CharField(source='location.code', read_only=True)
    location_type = serializers.CharField(source='location.location_type', read_only=True)

    class Meta:
        model = InventoryItem
        fields = ['id', 'location', 'location_name', 'location_code', 'location_type', 'quantity_on_hand', 'quantity_reserved', 'quantity_available', 'aisle_shelf']


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    total_stock = serializers.IntegerField(read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'sku', 'name', 'category', 'category_name', 'supplier', 'supplier_name',
            'description', 'unit_of_measure', 'cost_price', 'selling_price',
            'reorder_point', 'safety_stock', 'image_url', 'status',
            'total_stock', 'is_low_stock', 'created_at', 'updated_at'
        ]


class ProductDetailSerializer(ProductSerializer):
    inventory_items = InventorySummarySerializer(many=True, read_only=True)

    class Meta(ProductSerializer.Meta):
        fields = ProductSerializer.Meta.fields + ['inventory_items']
