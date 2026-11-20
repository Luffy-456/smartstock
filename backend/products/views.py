from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum, F, Q
from products.models import Category, Product
from products.serializers import CategorySerializer, ProductSerializer, ProductDetailSerializer

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['name', 'created_at']


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related('category', 'supplier').all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'supplier', 'status']
    search_fields = ['name', 'sku', 'description']
    ordering_fields = ['name', 'selling_price', 'cost_price', 'created_at']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        low_stock_only = self.request.query_params.get('low_stock')
        if low_stock_only and low_stock_only.lower() in ('true', '1'):
            # Filter products where total stock is <= reorder_point
            product_ids = [p.id for p in qs if p.is_low_stock]
            return qs.filter(id__in=product_ids)
        return qs

    @action(detail=False, methods=['get'])
    def low_stock_alerts(self, request):
        products = self.get_queryset()
        alerts = []
        for p in products:
            if p.is_low_stock:
                alerts.append({
                    'id': p.id,
                    'sku': p.sku,
                    'name': p.name,
                    'category': p.category.name,
                    'current_stock': p.total_stock,
                    'reorder_point': p.reorder_point,
                    'safety_stock': p.safety_stock,
                    'deficit': max(0, p.reorder_point - p.total_stock + p.safety_stock),
                    'cost_price': float(p.cost_price),
                    'status': p.status
                })
        return Response(alerts)
