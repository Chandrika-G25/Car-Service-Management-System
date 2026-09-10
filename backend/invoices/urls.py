from django.urls import path
from .views import InvoiceListCreateView, InvoiceDetailView, RecordPaymentView

urlpatterns = [
    path('', InvoiceListCreateView.as_view(), name='invoice-list-create'),
    path('<int:pk>/', InvoiceDetailView.as_view(), name='invoice-detail'),
    path('<int:pk>/payments/', RecordPaymentView.as_view(), name='invoice-record-payment'),
]
