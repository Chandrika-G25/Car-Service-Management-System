from django.urls import path
from .views import (
    AdminCustomerListView,
    AdminCustomerDetailView,
    AdminToggleCustomerActiveView,
    AdminEngineerListCreateView,
    AdminEngineerDetailView,
)
from vehicles.views import AdminVehicleListView
from services.views import ServiceRequestListCreateView, AdminAssignEngineerView, AdminUpdateCostsView

urlpatterns = [
    path('customers/', AdminCustomerListView.as_view(), name='admin-customers-list'),
    path('customers/<int:pk>/', AdminCustomerDetailView.as_view(), name='admin-customer-detail'),
    path('customers/<int:pk>/toggle-active/', AdminToggleCustomerActiveView.as_view(), name='admin-customer-toggle-active'),
    path('engineers/', AdminEngineerListCreateView.as_view(), name='admin-engineers-list'),
    path('engineers/<int:pk>/', AdminEngineerDetailView.as_view(), name='admin-engineer-detail'),
    path('vehicles/', AdminVehicleListView.as_view(), name='admin-vehicles-list'),
    path('service-requests/', ServiceRequestListCreateView.as_view(), name='admin-service-requests-list'),
    path('service-requests/<int:pk>/assign/', AdminAssignEngineerView.as_view(), name='admin-service-request-assign'),
    path('service-requests/<int:pk>/costs/', AdminUpdateCostsView.as_view(), name='admin-service-request-costs'),
]
