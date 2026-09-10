from rest_framework import serializers
from .models import Car


class CarSerializer(serializers.ModelSerializer):
    customer_name = serializers.ReadOnlyField(source="customer.full_name")
    customer_email = serializers.ReadOnlyField(source="customer.email")
    customer_phone = serializers.ReadOnlyField(source="customer.phone")

    class Meta:
        model = Car
        fields = [
            "id",
            "customer",
            "customer_name",
            "customer_email",
            "customer_phone",
            "brand",
            "model",
            "registration_number",
            "manufacturing_year",
            "fuel_type",
            "color",
            "mileage",
            "vin_number",
            "image",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "customer", "customer_name", "customer_email", "customer_phone", "created_at", "updated_at"]

    def validate_registration_number(self, value):
        reg = value.strip().upper()
        # If updating existing instance, ignore current instance
        instance = getattr(self, "instance", None)
        query = Car.objects.filter(registration_number__iexact=reg)
        if instance:
            query = query.exclude(pk=instance.pk)
        if query.exists():
            raise serializers.ValidationError("A vehicle with this registration number already exists.")
        return reg

    def create(self, validated_data):
        # Automatically set customer to request user if not set
        request = self.context.get("request")
        if request and request.user and request.user.is_authenticated:
            validated_data["customer"] = request.user
        return super().create(validated_data)
