from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from inventory.models import Location, InventoryItem, StockTransfer, StockAdjustment
from inventory.serializers import (
    LocationSerializer, InventoryItemSerializer, StockTransferSerializer, StockAdjustmentSerializer
)
from stocksmart.services import InventoryService

class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.prefetch_related('inventory_items').all()
    serializer_class = LocationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['location_type', 'city', 'state', 'is_active']
    search_fields = ['name', 'code', 'city', 'manager_name']
    ordering_fields = ['name', 'location_type', 'created_at']


class InventoryItemViewSet(viewsets.ModelViewSet):
    queryset = InventoryItem.objects.select_related('product', 'product__category', 'location').all()
    serializer_class = InventoryItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['location', 'product', 'product__category']
    search_fields = ['product__name', 'product__sku', 'location__name', 'location__code', 'aisle_shelf']
    ordering_fields = ['quantity_on_hand', 'product__name', 'location__name']


class StockTransferViewSet(viewsets.ModelViewSet):
    queryset = StockTransfer.objects.select_related('from_location', 'to_location', 'initiated_by').prefetch_related('items__product').all()
    serializer_class = StockTransferSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'from_location', 'to_location']
    search_fields = ['transfer_number', 'notes']

    def perform_create(self, serializer):
        serializer.save(initiated_by=self.request.user)

    @action(detail=True, methods=['post'])
    def dispatch_transfer(self, request, pk=None):
        transfer = self.get_object()
        if transfer.status != StockTransfer.PENDING:
            return Response({'error': f'Cannot dispatch transfer with status {transfer.status}'}, status=status.HTTP_400_BAD_REQUEST)
        transfer.status = StockTransfer.IN_TRANSIT
        transfer.save(update_fields=['status'])
        return Response(StockTransferSerializer(transfer).data)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        transfer = self.get_object()
        if transfer.status not in (StockTransfer.PENDING, StockTransfer.IN_TRANSIT):
            return Response({'error': f'Cannot complete transfer with status {transfer.status}'}, status=status.HTTP_400_BAD_REQUEST)
        InventoryService.complete_stock_transfer(transfer)
        return Response(StockTransferSerializer(transfer).data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        transfer = self.get_object()
        if transfer.status == StockTransfer.COMPLETED:
            return Response({'error': 'Cannot cancel already completed transfer'}, status=status.HTTP_400_BAD_REQUEST)
        transfer.status = StockTransfer.CANCELLED
        transfer.save(update_fields=['status'])
        return Response(StockTransferSerializer(transfer).data)


class StockAdjustmentViewSet(viewsets.ModelViewSet):
    queryset = StockAdjustment.objects.select_related('location', 'product', 'adjusted_by').all()
    serializer_class = StockAdjustmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['location', 'product', 'reason']
    search_fields = ['adjustment_number', 'notes']

    def create(self, request, *args, **kwargs):
        location_id = request.data.get('location')
        product_id = request.data.get('product')
        adjusted_quantity = int(request.data.get('adjusted_quantity', 0))
        reason = request.data.get('reason', StockAdjustment.REASON_OTHER)
        notes = request.data.get('notes', '')

        location = Location.objects.get(id=location_id)
        from products.models import Product
        product = Product.objects.get(id=product_id)

        adj = InventoryService.apply_stock_adjustment(
            location=location,
            product=product,
            adjusted_quantity=adjusted_quantity,
            reason=reason,
            user=request.user,
            notes=notes
        )
        return Response(StockAdjustmentSerializer(adj).data, status=status.HTTP_201_CREATED)
