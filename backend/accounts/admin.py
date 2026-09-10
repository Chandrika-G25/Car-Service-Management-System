from django.contrib import admin
from .models import User, CustomerProfile, EngineerProfile

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('id', 'full_name', 'email', 'phone', 'role', 'is_active', 'created_at')
    list_filter = ('role', 'is_active')
    search_fields = ('full_name', 'email', 'phone')
    ordering = ('-created_at',)

@admin.register(CustomerProfile)
class CustomerProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'city', 'state', 'pincode', 'created_at')
    search_fields = ('user__full_name', 'user__email', 'city')

@admin.register(EngineerProfile)
class EngineerProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'employee_id', 'user', 'specialization', 'experience_years', 'availability_status')
    list_filter = ('availability_status', 'specialization')
    search_fields = ('employee_id', 'user__full_name', 'user__email')
