from django.urls import path
from .views import (
    EngineerAssignedServicesView,
    EngineerUpdateStatusView,
    EngineerAddNotesView,
    ServiceRequestDetailView,
)

urlpatterns = [
    path('services/', EngineerAssignedServicesView.as_view(), name='engineer-services-list'),
    path('services/<int:pk>/', ServiceRequestDetailView.as_view(), name='engineer-service-detail'),
    path('services/<int:pk>/status/', EngineerUpdateStatusView.as_view(), name='engineer-service-status'),
    path('services/<int:pk>/notes/', EngineerAddNotesView.as_view(), name='engineer-service-notes'),
]
