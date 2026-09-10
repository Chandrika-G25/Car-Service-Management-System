from django.urls import path
from .views import ServiceCategoryListCreateView

urlpatterns = [
    path('', ServiceCategoryListCreateView.as_view(), name='service-categories'),
]
