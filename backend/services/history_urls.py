from django.urls import path
from .views import ServiceHistoryListView

urlpatterns = [
    path('', ServiceHistoryListView.as_view(), name='service-history-list'),
]
