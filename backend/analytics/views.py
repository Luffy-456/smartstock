from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.db.models import Sum, Count, F
from django.db.models.functions import TruncMonth, TruncDate
from stocksmart.services import AnalyticsService
from products.models import Product, Category
from inventory.models import Location, InventoryItem
from orders.models import Order, OrderItem

class KPIOverviewView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        kpis = AnalyticsService.get_dashboard_kpis()
        return Response(kpis)


class SalesTrendView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Aggregate completed/active orders by month or date
        trend = (
            Order.objects.exclude(status=Order.CANCELLED)
            .annotate(period=TruncMonth('order_date'))
            .values('period')
            .annotate(
                order_count=Count('id'),
                total_revenue=Sum('total_amount')
            )
            .order_by('period')
        )
        data = [
            {
                'period': item['period'].strftime('%b %Y') if item['period'] else 'N/A',
                'order_count': item['order_count'],
                'total_revenue': float(item['total_revenue'] or 0.0),
            }
            for item in trend
        ]
        return Response(data)


class CategoryBreakdownView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        categories = Category.objects.all()
        result = []
        for cat in categories:
            prods = cat.products.all()
            total_items = InventoryItem.objects.filter(product__in=prods).aggregate(total=Sum('quantity_on_hand'))['total'] or 0
            valuation = sum(
                (item.quantity_on_hand * item.product.cost_price)
                for item in InventoryItem.objects.filter(product__in=prods).select_related('product')
            )
            result.append({
                'category_id': cat.id,
                'category_name': cat.name,
                'product_count': prods.count(),
                'total_quantity': total_items,
                'valuation': float(valuation)
            })
        # Sort descending by valuation
        result.sort(key=lambda x: x['valuation'], reverse=True)
        return Response(result)


class LocationBreakdownView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        locations = Location.objects.all()
        result = []
        for loc in locations:
            inv = loc.inventory_items.select_related('product').all()
            total_qty = sum(i.quantity_on_hand for i in inv)
            val = sum(i.quantity_on_hand * i.product.cost_price for i in inv)
            result.append({
                'location_id': loc.id,
                'location_name': loc.name,
                'location_code': loc.code,
                'location_type': loc.location_type,
                'city': loc.city,
                'total_items': total_qty,
                'total_valuation': float(val),
                'sku_count': len([i for i in inv if i.quantity_on_hand > 0])
            })
        return Response(result)


class TopProductsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        top_items = (
            OrderItem.objects.exclude(order__status=Order.CANCELLED)
            .values('product__id', 'product__sku', 'product__name', 'product__category__name')
            .annotate(
                total_units_sold=Sum('quantity'),
                total_revenue_generated=Sum('subtotal')
            )
            .order_by('-total_revenue_generated')[:5]
        )
        return Response(list(top_items))


class ReorderRecommendationsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        products = Product.objects.filter(status=Product.ACTIVE).select_related('category', 'supplier').prefetch_related('inventory_items')
        recommendations = []
        for p in products:
            total_stock = sum(i.quantity_on_hand for i in p.inventory_items.all())
            if total_stock <= p.reorder_point:
                # Recommended order = (Reorder Point + Safety Stock - Current Stock)
                rec_qty = max(20, (p.reorder_point * 2) - total_stock)
                est_cost = rec_qty * float(p.cost_price)
                recommendations.append({
                    'product_id': p.id,
                    'sku': p.sku,
                    'product_name': p.name,
                    'category': p.category.name,
                    'supplier_name': p.supplier.name if p.supplier else 'N/A',
                    'supplier_lead_time': p.supplier.lead_time_days if p.supplier else 7,
                    'current_stock': total_stock,
                    'reorder_point': p.reorder_point,
                    'safety_stock': p.safety_stock,
                    'recommended_order_quantity': rec_qty,
                    'estimated_cost_inr': est_cost,
                    'urgency': 'CRITICAL' if total_stock == 0 else ('HIGH' if total_stock < p.safety_stock else 'MEDIUM')
                })
        recommendations.sort(key=lambda x: (x['urgency'] != 'CRITICAL', x['current_stock']))
        return Response(recommendations)
