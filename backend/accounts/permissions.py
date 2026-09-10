from rest_framework.permissions import BasePermission

class IsAdminUserRole(BasePermission):
    """
    Allows access only to users with the ADMIN role or superusers.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            (request.user.role == "ADMIN" or request.user.is_superuser)
        )


class IsCustomerUserRole(BasePermission):
    """
    Allows access only to users with the CUSTOMER role.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.role == "CUSTOMER"
        )


class IsEngineerUserRole(BasePermission):
    """
    Allows access only to users with the ENGINEER role.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.role == "ENGINEER"
        )
