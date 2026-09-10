from django.contrib import admin
from .models import Car

@admin.register(Car)
class CarAdmin(admin.ModelAdmin):
    list_display = ('id', 'registration_number', 'brand', 'model', 'customer', 'manufacturing_year', 'fuel_type', 'mileage')
    list_filter = ('brand', 'fuel_type', 'manufacturing_year')
    search_fields = ('registration_number', 'brand', 'model', 'customer__full_name', 'customer__email')
    ordering = ('-created_at',)
