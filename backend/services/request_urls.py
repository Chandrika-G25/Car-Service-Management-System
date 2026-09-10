from django.urls import path
from .views import (
    ServiceRequestListCreateView,
    ServiceRequestDetailView,
    CustomerCancelServiceView,
    AdminAssignEngineerView,
    AdminUpdateCostsView,
)

urlpatterns = [
    path('', ServiceRequestListCreateView.as_view(), name='service-requests-list-create'),
    path('<int:pk>/', ServiceRequestDetailView.as_view(), name='service-request-detail'),
    path('<int:pk>/cancel/', CustomerCancelServiceView.as_view(), name='service-request-cancel'),
    path('<int:pk>/assign/', AdminAssignEngineerView.as_view(), name='service-request-assign'),
    path('<int:pk>/costs/', AdminUpdateCostsView.as_view(), name='service-request-costs'),
]
