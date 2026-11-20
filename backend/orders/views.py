from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from orders.models import Customer, Order, OrderItem
from orders.serializers import CustomerSerializer, OrderSerializer
from stocksmart.services import InventoryService

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.prefetch_related('orders').all()
    serializer_class = CustomerSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'email', 'phone', 'city']
    ordering_fields = ['name', 'created_at']


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.select_related('customer', 'location').prefetch_related('items__product').all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'payment_status', 'payment_method', 'location']
    search_fields = ['order_number', 'customer__name', 'customer__phone', 'notes']
    ordering_fields = ['order_date', 'total_amount', 'status']

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get('status')
        if not new_status or new_status not in dict(Order.STATUS_CHOICES):
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

        prev_status = order.status
        order.status = new_status

        if new_status == Order.SHIPPED and not order.shipped_date:
            order.shipped_date = timezone.now()
        elif new_status == Order.DELIVERED and not order.delivery_date:
            order.delivery_date = timezone.now()

        # If transitioning from PENDING to PROCESSING/CONFIRMED/SHIPPED, fulfill stock
        if prev_status == Order.PENDING and new_status in (Order.CONFIRMED, Order.PROCESSING, Order.SHIPPED, Order.DELIVERED):
            InventoryService.process_order_fulfillment(order)
        # If cancelled after confirmation, return stock
        elif prev_status in (Order.CONFIRMED, Order.PROCESSING, Order.PACKED) and new_status == Order.CANCELLED:
            InventoryService.cancel_order_restock(order)

        order.save()
        return Response(OrderSerializer(order).data)
