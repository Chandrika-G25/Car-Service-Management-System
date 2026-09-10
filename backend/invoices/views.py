from rest_framework import generics, permissions, status, views
from rest_framework.response import Response
from django.db.models import Q, Sum
from .models import Invoice, Payment
from .serializers import InvoiceSerializer, PaymentSerializer
from services.models import ServiceRequest
from accounts.permissions import IsAdminUserRole
from notifications.models import Notification


class InvoiceListCreateView(generics.ListCreateAPIView):
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Invoice.objects.all().select_related("service_request", "customer", "service_request__car").prefetch_related("payments")

        if user.role == "CUSTOMER":
            queryset = queryset.filter(customer=user)

        search = self.request.query_params.get("search", "").strip()
        status_param = self.request.query_params.get("status")

        if search:
            queryset = queryset.filter(
                Q(invoice_number__icontains=search) |
                Q(service_request__request_number__icontains=search) |
                Q(customer__full_name__icontains=search) |
                Q(customer__email__icontains=search)
            )

        if status_param:
            queryset = queryset.filter(payment_status=status_param.upper())

        return queryset.order_by("-created_at")

    def create(self, request, *args, **kwargs):
        if request.user.role != "ADMIN" and not request.user.is_superuser:
            return Response({"error": "Only admins can manually generate invoices."}, status=status.HTTP_403_FORBIDDEN)

        service_request_id = request.data.get("service_request_id")
        try:
            service_req = ServiceRequest.objects.get(pk=service_request_id)
        except ServiceRequest.DoesNotExist:
            return Response({"error": "Service request not found."}, status=status.HTTP_404_NOT_FOUND)

        if hasattr(service_req, "invoice"):
            return Response({"error": "Invoice already exists for this service request."}, status=status.HTTP_400_BAD_REQUEST)

        subtotal = float(request.data.get("subtotal") or service_req.final_cost or service_req.estimated_cost or 0)
        tax = float(request.data.get("tax") or round(subtotal * 0.18, 2))
        discount = float(request.data.get("discount") or 0.00)
        total = round(subtotal + tax - discount, 2)

        invoice = Invoice.objects.create(
            service_request=service_req,
            customer=service_req.customer,
            subtotal=subtotal,
            tax=tax,
            discount=discount,
            total_amount=total,
            payment_status=request.data.get("payment_status", "PENDING"),
        )

        Notification.objects.create(
            user=service_req.customer,
            title="Invoice Generated",
            message=f"Invoice {invoice.invoice_number} for amount ${invoice.total_amount:.2f} is now ready for service {service_req.request_number}.",
            notification_type="INVOICE_GENERATED",
        )

        return Response(InvoiceSerializer(invoice).data, status=status.HTTP_201_CREATED)


class InvoiceDetailView(generics.RetrieveAPIView):
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Invoice.objects.all().select_related("service_request", "customer", "service_request__car").prefetch_related("payments")
        if user.role == "CUSTOMER":
            return queryset.filter(customer=user)
        return queryset


class RecordPaymentView(views.APIView):
    permission_classes = [IsAdminUserRole]

    def post(self, request, pk):
        try:
            invoice = Invoice.objects.get(pk=pk)
        except Invoice.DoesNotExist:
            return Response({"error": "Invoice not found."}, status=status.HTTP_404_NOT_FOUND)

        amount = request.data.get("amount")
        payment_method = request.data.get("payment_method", "CASH")
        transaction_reference = request.data.get("transaction_reference", "")

        if not amount:
            return Response({"error": "Payment amount is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            amount = float(amount)
            if amount <= 0:
                raise ValueError
        except ValueError:
            return Response({"error": "Payment amount must be a positive number."}, status=status.HTTP_400_BAD_REQUEST)

        payment = Payment.objects.create(
            invoice=invoice,
            amount=amount,
            payment_method=payment_method,
            transaction_reference=transaction_reference,
            payment_status="COMPLETED",
        )

        # Calculate total paid so far
        total_paid = Payment.objects.filter(invoice=invoice, payment_status="COMPLETED").aggregate(Sum("amount"))["amount__sum"] or 0

        if total_paid >= float(invoice.total_amount):
            invoice.payment_status = "PAID"
        elif total_paid > 0:
            invoice.payment_status = "PARTIAL"
        invoice.save()

        # Notify customer
        Notification.objects.create(
            user=invoice.customer,
            title="Payment Recorded",
            message=f"A payment of ${amount:.2f} via {payment_method} has been credited for invoice {invoice.invoice_number}. Status: {invoice.payment_status}.",
            notification_type="PAYMENT_RECEIVED",
        )

        return Response(
            {
                "message": "Payment recorded successfully.",
                "payment": PaymentSerializer(payment).data,
                "invoice": InvoiceSerializer(invoice).data,
            },
            status=status.HTTP_201_CREATED,
        )
