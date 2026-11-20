"""
URL configuration for stocksmart project.
"""

from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static

def health_check(request):
    return JsonResponse({
        'status': 'ok',
        'service': 'StockSmart Retail Inventory API',
        'version': '1.0.0',
        'database': 'Connected',
        'environment': 'Production' if not settings.DEBUG else 'Development'
    })

urlpatterns = [
    path('', health_check, name='root-health-check'),
    path('health/', health_check, name='health-check-short'),
    path('admin/', admin.site.urls),
    path('api/health/', health_check, name='health-check'),
    path('api/', include('users.urls')),
    path('api/', include('products.urls')),
    path('api/', include('inventory.urls')),
    path('api/', include('orders.urls')),
    path('api/', include('suppliers.urls')),
    path('api/analytics/', include('analytics.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
