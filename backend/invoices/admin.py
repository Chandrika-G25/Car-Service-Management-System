from django.contrib import admin
from .models import Invoice, Payment

@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('id', 'invoice_number', 'service_request', 'customer', 'total_amount', 'payment_status', 'issued_date')
    list_filter = ('payment_status', 'issued_date')
    search_fields = ('invoice_number', 'customer__full_name', 'customer__email', 'service_request__request_number')
    ordering = ('-created_at',)

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('id', 'invoice', 'amount', 'payment_method', 'payment_status', 'payment_date')
    list_filter = ('payment_method', 'payment_status')
    search_fields = ('invoice__invoice_number', 'transaction_reference')
