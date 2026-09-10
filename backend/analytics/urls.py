from django.urls import path
from .views import (
    AdminDashboardAnalyticsView,
    CustomerDashboardAnalyticsView,
    EngineerDashboardAnalyticsView,
)

urlpatterns = [
    path('admin/', AdminDashboardAnalyticsView.as_view(), name='analytics-admin'),
    path('customer/', CustomerDashboardAnalyticsView.as_view(), name='analytics-customer'),
    path('engineer/', EngineerDashboardAnalyticsView.as_view(), name='analytics-engineer'),
]
