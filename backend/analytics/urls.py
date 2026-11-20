from django.urls import path
from analytics.views import (
    KPIOverviewView, SalesTrendView, CategoryBreakdownView,
    LocationBreakdownView, TopProductsView, ReorderRecommendationsView
)

urlpatterns = [
    path('kpis/', KPIOverviewView.as_view(), name='analytics-kpis'),
    path('sales-trend/', SalesTrendView.as_view(), name='analytics-sales-trend'),
    path('category-breakdown/', CategoryBreakdownView.as_view(), name='analytics-category-breakdown'),
    path('location-breakdown/', LocationBreakdownView.as_view(), name='analytics-location-breakdown'),
    path('top-products/', TopProductsView.as_view(), name='analytics-top-products'),
    path('reorder-recommendations/', ReorderRecommendationsView.as_view(), name='analytics-reorder-recommendations'),
]
