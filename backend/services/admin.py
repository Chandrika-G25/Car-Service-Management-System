from django.contrib import admin
from .models import ServiceCategory, ServiceRequest, ServiceHistory

@admin.register(ServiceCategory)
class ServiceCategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'estimated_cost', 'estimated_duration', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name', 'description')

@admin.register(ServiceRequest)
class ServiceRequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'request_number', 'customer', 'car', 'service_category', 'assigned_engineer', 'current_status', 'preferred_date', 'estimated_cost', 'final_cost')
    list_filter = ('current_status', 'service_category', 'preferred_date')
    search_fields = ('request_number', 'customer__full_name', 'customer__email', 'car__registration_number')
    ordering = ('-created_at',)

@admin.register(ServiceHistory)
class ServiceHistoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'service_request', 'previous_status', 'new_status', 'updated_by', 'created_at')
    list_filter = ('new_status',)
    search_fields = ('service_request__request_number', 'remarks')
    ordering = ('-created_at',)
