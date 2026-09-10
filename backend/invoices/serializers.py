from rest_framework import serializers
from .models import Invoice, Payment
from services.serializers import ServiceRequestSerializer


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            "id",
            "invoice",
            "amount",
            "payment_method",
            "transaction_reference",
            "payment_date",
            "payment_status",
        ]
        read_only_fields = ["id", "payment_date"]


class InvoiceSerializer(serializers.ModelSerializer):
    customer_name = serializers.ReadOnlyField(source="customer.full_name")
    customer_email = serializers.ReadOnlyField(source="customer.email")
    service_request_number = serializers.ReadOnlyField(source="service_request.request_number")
    car_name = serializers.SerializerMethodField()
    service_category_name = serializers.ReadOnlyField(source="service_request.service_category.name")
    payments = PaymentSerializer(many=True, read_only=True)

    class Meta:
        model = Invoice
        fields = [
            "id",
            "invoice_number",
            "service_request",
            "service_request_number",
            "customer",
            "customer_name",
            "customer_email",
            "car_name",
            "service_category_name",
            "subtotal",
            "tax",
            "discount",
            "total_amount",
            "payment_status",
            "issued_date",
            "payments",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "invoice_number", "customer", "customer_name", "customer_email", "created_at", "updated_at"]

    def get_car_name(self, obj):
        if obj.service_request and obj.service_request.car:
            car = obj.service_request.car
            return f"{car.brand} {car.model} ({car.registration_number})"
        return "N/A"
