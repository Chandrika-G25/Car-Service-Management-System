from rest_framework import serializers
from .models import ServiceCategory, ServiceRequest, ServiceHistory
from vehicles.models import Car
from vehicles.serializers import CarSerializer


class ServiceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceCategory
        fields = ["id", "name", "description", "estimated_cost", "estimated_duration", "is_active"]


class ServiceHistorySerializer(serializers.ModelSerializer):
    updated_by_name = serializers.ReadOnlyField(source="updated_by.full_name")
    updated_by_role = serializers.ReadOnlyField(source="updated_by.role")

    class Meta:
        model = ServiceHistory
        fields = [
            "id",
            "service_request",
            "previous_status",
            "new_status",
            "updated_by",
            "updated_by_name",
            "updated_by_role",
            "remarks",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class ServiceRequestSerializer(serializers.ModelSerializer):
    customer_name = serializers.ReadOnlyField(source="customer.full_name")
    customer_email = serializers.ReadOnlyField(source="customer.email")
    customer_phone = serializers.ReadOnlyField(source="customer.phone")
    car_details = CarSerializer(source="car", read_only=True)
    category_name = serializers.ReadOnlyField(source="service_category.name")
    engineer_name = serializers.ReadOnlyField(source="assigned_engineer.full_name")
    engineer_employee_id = serializers.ReadOnlyField(source="assigned_engineer.engineer_profile.employee_id")
    history = ServiceHistorySerializer(many=True, read_only=True)

    # Writable IDs for relationship binding
    car_id = serializers.PrimaryKeyRelatedField(
        queryset=Car.objects.all(), source="car", write_only=True
    )
    service_category_id = serializers.PrimaryKeyRelatedField(
        queryset=ServiceCategory.objects.filter(is_active=True),
        source="service_category",
        write_only=True,
    )

    class Meta:
        model = ServiceRequest
        fields = [
            "id",
            "request_number",
            "customer",
            "customer_name",
            "customer_email",
            "customer_phone",
            "car",
            "car_id",
            "car_details",
            "service_category",
            "service_category_id",
            "category_name",
            "assigned_engineer",
            "engineer_name",
            "engineer_employee_id",
            "description",
            "preferred_date",
            "preferred_time",
            "current_status",
            "estimated_cost",
            "final_cost",
            "current_mileage",
            "history",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "request_number",
            "customer",
            "customer_name",
            "customer_email",
            "customer_phone",
            "car",
            "service_category",
            "assigned_engineer",
            "current_status",
            "final_cost",
            "history",
            "created_at",
            "updated_at",
        ]

    def validate_car_id(self, value):
        request = self.context.get("request")
        if request and request.user and request.user.role == "CUSTOMER":
            if value.customer != request.user:
                raise serializers.ValidationError("You can only book service for your own vehicles.")
        return value

    def create(self, validated_data):
        request = self.context.get("request")
        if request and request.user:
            validated_data["customer"] = request.user
        category = validated_data.get("service_category")
        if category and not validated_data.get("estimated_cost"):
            validated_data["estimated_cost"] = category.estimated_cost
            validated_data["final_cost"] = category.estimated_cost

        service_req = super().create(validated_data)

        # Log initial history entry
        ServiceHistory.objects.create(
            service_request=service_req,
            previous_status=None,
            new_status="PENDING",
            updated_by=request.user if request else None,
            remarks="Service booking created by customer.",
        )

        # Create database notification for customer
        from notifications.models import Notification
        Notification.objects.create(
            user=service_req.customer,
            title="Service Request Created",
            message=f"Your service request {service_req.request_number} for {service_req.car.brand} {service_req.car.model} has been booked successfully.",
            notification_type="SERVICE_CREATED",
        )

        return service_req
