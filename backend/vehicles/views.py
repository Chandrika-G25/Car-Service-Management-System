from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.db.models import Q
from .models import Car
from .serializers import CarSerializer
from accounts.permissions import IsAdminUserRole


class CarListCreateView(generics.ListCreateAPIView):
    serializer_class = CarSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        search = self.request.query_params.get("search", "").strip()
        brand = self.request.query_params.get("brand", "").strip()

        if user.role == "CUSTOMER":
            queryset = Car.objects.filter(customer=user)
        else:
            queryset = Car.objects.all().select_related("customer")

        if search:
            queryset = queryset.filter(
                Q(registration_number__icontains=search) |
                Q(brand__icontains=search) |
                Q(model__icontains=search) |
                Q(vin_number__icontains=search)
            )

        if brand:
            queryset = queryset.filter(brand__iexact=brand)

        return queryset.order_by("-created_at")

    def perform_create(self, serializer):
        user = self.request.user
        # If admin passes customer id, allow assigning to customer
        customer_id = self.request.data.get("customer_id")
        if user.role == "ADMIN" and customer_id:
            from accounts.models import User
            try:
                target_user = User.objects.get(pk=customer_id, role="CUSTOMER")
                serializer.save(customer=target_user)
                return
            except User.DoesNotExist:
                pass
        serializer.save(customer=user)


class CarDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CarSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "CUSTOMER":
            return Car.objects.filter(customer=user)
        return Car.objects.all().select_related("customer")

    def perform_destroy(self, instance):
        # Soft check or direct delete
        instance.delete()


class AdminVehicleListView(generics.ListAPIView):
    permission_classes = [IsAdminUserRole]
    serializer_class = CarSerializer

    def get_queryset(self):
        queryset = Car.objects.all().select_related("customer")
        search = self.request.query_params.get("search", "").strip()
        brand = self.request.query_params.get("brand", "").strip()
        fuel_type = self.request.query_params.get("fuel_type", "").strip()

        if search:
            queryset = queryset.filter(
                Q(registration_number__icontains=search) |
                Q(brand__icontains=search) |
                Q(model__icontains=search) |
                Q(customer__full_name__icontains=search) |
                Q(customer__email__icontains=search)
            )

        if brand:
            queryset = queryset.filter(brand__iexact=brand)

        if fuel_type:
            queryset = queryset.filter(fuel_type__iexact=fuel_type)

        return queryset.order_by("-created_at")
