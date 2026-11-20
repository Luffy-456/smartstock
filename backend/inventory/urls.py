from django.urls import path, include
from rest_framework.routers import DefaultRouter
from inventory.views import LocationViewSet, InventoryItemViewSet, StockTransferViewSet, StockAdjustmentViewSet

router = DefaultRouter()
router.register('locations', LocationViewSet, basename='location')
router.register('inventory-items', InventoryItemViewSet, basename='inventory-item')
router.register('transfers', StockTransferViewSet, basename='stock-transfer')
router.register('adjustments', StockAdjustmentViewSet, basename='stock-adjustment')

urlpatterns = [
    path('', include(router.urls)),
]
