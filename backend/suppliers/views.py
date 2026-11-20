from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from suppliers.models import Supplier, PurchaseOrder
from suppliers.serializers import SupplierSerializer, PurchaseOrderSerializer
from stocksmart.services import InventoryService

class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.prefetch_related('purchase_orders').all()
    serializer_class = SupplierSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['city', 'state', 'is_active']
    search_fields = ['name', 'contact_person', 'email', 'phone', 'city']
    ordering_fields = ['name', 'rating', 'lead_time_days', 'created_at']


class PurchaseOrderViewSet(viewsets.ModelViewSet):
    queryset = PurchaseOrder.objects.select_related('supplier', 'destination_location', 'created_by').prefetch_related('items__product').all()
    serializer_class = PurchaseOrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'supplier', 'destination_location']
    search_fields = ['po_number', 'supplier__name', 'notes']
    ordering_fields = ['order_date', 'total_amount', 'status']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def receive_po(self, request, pk=None):
        po = self.get_object()
        if po.status == PurchaseOrder.RECEIVED:
            return Response({'error': 'Purchase order has already been received'}, status=status.HTTP_400_BAD_REQUEST)
        if po.status == PurchaseOrder.CANCELLED:
            return Response({'error': 'Cannot receive a cancelled purchase order'}, status=status.HTTP_400_BAD_REQUEST)

        InventoryService.receive_purchase_order(po)
        return Response(PurchaseOrderSerializer(po).data)

    @action(detail=True, methods=['post'])
    def cancel_po(self, request, pk=None):
        po = self.get_object()
        if po.status == PurchaseOrder.RECEIVED:
            return Response({'error': 'Cannot cancel an already received purchase order'}, status=status.HTTP_400_BAD_REQUEST)
        po.status = PurchaseOrder.CANCELLED
        po.save(update_fields=['status'])
        return Response(PurchaseOrderSerializer(po).data)
