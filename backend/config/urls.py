"""
URL configuration for CSMS project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin-django/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/profile/', include('accounts.profile_urls')),
    path('api/cars/', include('vehicles.urls')),
    path('api/service-categories/', include('services.category_urls')),
    path('api/service-requests/', include('services.request_urls')),
    path('api/service-history/', include('services.history_urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/invoices/', include('invoices.urls')),
    path('api/admin/', include('accounts.admin_urls')),
    path('api/engineer/', include('services.engineer_urls')),
    path('api/analytics/', include('analytics.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
