from rest_framework import generics, permissions, status, views
from rest_framework.response import Response
from django.db.models import Q
from django.utils import timezone
from .models import ServiceCategory, ServiceRequest, ServiceHistory
from .serializers import ServiceCategorySerializer, ServiceRequestSerializer, ServiceHistorySerializer
from accounts.models import User
from accounts.permissions import IsAdminUserRole, IsEngineerUserRole
from notifications.models import Notification


class ServiceCategoryListCreateView(generics.ListCreateAPIView):
    serializer_class = ServiceCategorySerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAdminUserRole()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        if self.request.user.role == "ADMIN":
            return ServiceCategory.objects.all()
        return ServiceCategory.objects.filter(is_active=True)


class ServiceRequestListCreateView(generics.ListCreateAPIView):
    serializer_class = ServiceRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = ServiceRequest.objects.all().select_related(
            "customer", "car", "service_category", "assigned_engineer", "assigned_engineer__engineer_profile"
        ).prefetch_related("history")

        if user.role == "CUSTOMER":
            queryset = queryset.filter(customer=user)
        elif user.role == "ENGINEER":
            queryset = queryset.filter(assigned_engineer=user)

        # Apply filtering
        status_param = self.request.query_params.get("status")
        category_param = self.request.query_params.get("category")
        engineer_param = self.request.query_params.get("engineer")
        search = self.request.query_params.get("search", "").strip()
        date_from = self.request.query_params.get("date_from")
        date_to = self.request.query_params.get("date_to")

        if status_param:
            queryset = queryset.filter(current_status=status_param.upper())
        if category_param:
            queryset = queryset.filter(service_category_id=category_param)
        if engineer_param and user.role == "ADMIN":
            queryset = queryset.filter(assigned_engineer_id=engineer_param)
        if date_from:
            queryset = queryset.filter(preferred_date__gte=date_from)
        if date_to:
            queryset = queryset.filter(preferred_date__lte=date_to)

        if search:
            queryset = queryset.filter(
                Q(request_number__icontains=search) |
                Q(car__registration_number__icontains=search) |
                Q(car__brand__icontains=search) |
                Q(car__model__icontains=search) |
                Q(customer__full_name__icontains=search) |
                Q(customer__email__icontains=search)
            )

        return queryset.order_by("-created_at")


class ServiceRequestDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = ServiceRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = ServiceRequest.objects.all().select_related(
            "customer", "car", "service_category", "assigned_engineer", "assigned_engineer__engineer_profile"
        ).prefetch_related("history")

        if user.role == "CUSTOMER":
            return queryset.filter(customer=user)
        elif user.role == "ENGINEER":
            return queryset.filter(assigned_engineer=user)
        return queryset


class CustomerCancelServiceView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, pk):
        user = request.user
        try:
            service = ServiceRequest.objects.get(pk=pk, customer=user)
        except ServiceRequest.DoesNotExist:
            return Response({"error": "Service request not found."}, status=status.HTTP_404_NOT_FOUND)

        if service.current_status not in ["PENDING", "ASSIGNED"]:
            return Response(
                {"error": f"Cannot cancel a service that is currently {service.current_status}."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        prev_status = service.current_status
        service.current_status = "CANCELLED"
        service.save()

        # Record history
        ServiceHistory.objects.create(
            service_request=service,
            previous_status=prev_status,
            new_status="CANCELLED",
            updated_by=user,
            remarks=request.data.get("remarks", "Cancelled by customer."),
        )

        Notification.objects.create(
            user=user,
            title="Service Request Cancelled",
            message=f"Your service request {service.request_number} has been cancelled.",
            notification_type="SERVICE_CANCELLED",
        )

        return Response({"message": "Service cancelled successfully."}, status=status.HTTP_200_OK)


class AdminAssignEngineerView(views.APIView):
    permission_classes = [IsAdminUserRole]

    def put(self, request, pk):
        try:
            service = ServiceRequest.objects.get(pk=pk)
        except ServiceRequest.DoesNotExist:
            return Response({"error": "Service request not found."}, status=status.HTTP_404_NOT_FOUND)

        engineer_id = request.data.get("engineer_id")
        estimated_cost = request.data.get("estimated_cost")
        remarks = request.data.get("remarks", "Engineer assigned by administrator.")

        if not engineer_id:
            return Response({"error": "Please provide an engineer ID."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            engineer = User.objects.get(pk=engineer_id, role="ENGINEER", is_active=True)
        except User.DoesNotExist:
            return Response({"error": "Valid active service engineer not found."}, status=status.HTTP_404_NOT_FOUND)

        prev_status = service.current_status
        service.assigned_engineer = engineer
        service.current_status = "ASSIGNED"
        if estimated_cost is not None:
            service.estimated_cost = estimated_cost
            if not service.final_cost:
                service.final_cost = estimated_cost
        service.save()

        emp_id = getattr(engineer, "engineer_profile", None).employee_id if hasattr(engineer, "engineer_profile") else "ENG"
        ServiceHistory.objects.create(
            service_request=service,
            previous_status=prev_status,
            new_status="ASSIGNED",
            updated_by=request.user,
            remarks=f"Assigned to {engineer.full_name} ({emp_id}). {remarks}",
        )

        # Notify customer
        Notification.objects.create(
            user=service.customer,
            title="Engineer Assigned",
            message=f"Engineer {engineer.full_name} has been assigned to your service request {service.request_number}.",
            notification_type="ENGINEER_ASSIGNED",
        )

        # Notify engineer
        Notification.objects.create(
            user=engineer,
            title="New Service Assignment",
            message=f"You have been assigned to service request {service.request_number} for {service.car.brand} {service.car.model}.",
            notification_type="JOB_ASSIGNED",
        )

        return Response(
            {"message": "Engineer assigned successfully.", "service": ServiceRequestSerializer(service).data},
            status=status.HTTP_200_OK,
        )


class AdminUpdateCostsView(views.APIView):
    permission_classes = [IsAdminUserRole]

    def put(self, request, pk):
        try:
            service = ServiceRequest.objects.get(pk=pk)
        except ServiceRequest.DoesNotExist:
            return Response({"error": "Service request not found."}, status=status.HTTP_404_NOT_FOUND)

        estimated_cost = request.data.get("estimated_cost")
        final_cost = request.data.get("final_cost")

        if estimated_cost is not None:
            service.estimated_cost = estimated_cost
        if final_cost is not None:
            service.final_cost = final_cost
        service.save()

        return Response(
            {"message": "Costs updated successfully.", "service": ServiceRequestSerializer(service).data},
            status=status.HTTP_200_OK,
        )


# ------------------ Engineer Views ------------------ #

class EngineerAssignedServicesView(generics.ListAPIView):
    permission_classes = [IsEngineerUserRole]
    serializer_class = ServiceRequestSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = ServiceRequest.objects.filter(assigned_engineer=user).select_related(
            "customer", "car", "service_category", "assigned_engineer"
        ).prefetch_related("history")

        status_param = self.request.query_params.get("status")
        if status_param:
            queryset = queryset.filter(current_status=status_param.upper())

        return queryset.order_by("-created_at")


class EngineerUpdateStatusView(views.APIView):
    permission_classes = [IsEngineerUserRole]

    VALID_TRANSITIONS = {
        "ASSIGNED": ["IN_PROGRESS"],
        "IN_PROGRESS": ["INSPECTION"],
        "INSPECTION": ["REPAIRING"],
        "REPAIRING": ["TESTING"],
        "TESTING": ["COMPLETED"],
    }

    STATUS_MESSAGES = {
        "IN_PROGRESS": "Your vehicle service is now in progress.",
        "INSPECTION": "Your vehicle is currently undergoing multi-point inspection.",
        "REPAIRING": "Your vehicle is currently undergoing necessary repair work.",
        "TESTING": "Repairs complete. Vehicle is undergoing final diagnostic testing.",
        "COMPLETED": "Your vehicle service has been successfully completed and is ready for pickup.",
    }

    def put(self, request, pk):
        user = request.user
        try:
            service = ServiceRequest.objects.get(pk=pk, assigned_engineer=user)
        except ServiceRequest.DoesNotExist:
            return Response({"error": "Service request not found or not assigned to you."}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get("status", "").upper()
        remarks = request.data.get("remarks", "").strip()

        if not new_status:
            return Response({"error": "Status is required."}, status=status.HTTP_400_BAD_REQUEST)

        valid_next_statuses = self.VALID_TRANSITIONS.get(service.current_status, [])
        # Allow engineer to advance or mark completed
        all_allowed = ["IN_PROGRESS", "INSPECTION", "REPAIRING", "TESTING", "COMPLETED"]
        if new_status not in all_allowed:
            return Response(
                {"error": f"Invalid status {new_status}. Allowed: {', '.join(all_allowed)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        prev_status = service.current_status
        service.current_status = new_status

        # If completed, finalize cost if provided
        final_cost = request.data.get("final_cost")
        if final_cost is not None:
            service.final_cost = final_cost
        elif not service.final_cost:
            service.final_cost = service.estimated_cost

        service.save()

        # Log history
        ServiceHistory.objects.create(
            service_request=service,
            previous_status=prev_status,
            new_status=new_status,
            updated_by=user,
            remarks=remarks or f"Status transitioned to {new_status} by engineer {user.full_name}",
        )

        # Customer Notification
        notify_msg = self.STATUS_MESSAGES.get(new_status, f"Status updated to {new_status}")
        Notification.objects.create(
            user=service.customer,
            title=f"Service Update: {new_status.replace('_', ' ').title()}",
            message=f"{notify_msg} (Request: {service.request_number})",
            notification_type="STATUS_UPDATE",
        )

        # If COMPLETED, automatically generate invoice if one doesn't exist yet
        if new_status == "COMPLETED":
            from invoices.models import Invoice
            if not hasattr(service, "invoice"):
                subtotal = service.final_cost or service.estimated_cost
                tax = round(subtotal * 0.18, 2)  # standard 18% GST/tax
                total = subtotal + tax
                Invoice.objects.create(
                    service_request=service,
                    customer=service.customer,
                    subtotal=subtotal,
                    tax=tax,
                    discount=0.00,
                    total_amount=total,
                    payment_status="PENDING",
                )

        return Response(
            {"message": f"Status updated to {new_status}.", "service": ServiceRequestSerializer(service).data},
            status=status.HTTP_200_OK,
        )


class EngineerAddNotesView(views.APIView):
    permission_classes = [IsEngineerUserRole]

    def post(self, request, pk):
        user = request.user
        try:
            service = ServiceRequest.objects.get(pk=pk, assigned_engineer=user)
        except ServiceRequest.DoesNotExist:
            return Response({"error": "Service request not found or not assigned to you."}, status=status.HTTP_404_NOT_FOUND)

        notes = request.data.get("notes", "").strip()
        if not notes:
            return Response({"error": "Notes content cannot be empty."}, status=status.HTTP_400_BAD_REQUEST)

        history_entry = ServiceHistory.objects.create(
            service_request=service,
            previous_status=service.current_status,
            new_status=service.current_status,
            updated_by=user,
            remarks=f"Technical Note: {notes}",
        )

        return Response(
            {"message": "Technical note added successfully.", "history": ServiceHistorySerializer(history_entry).data},
            status=status.HTTP_201_CREATED,
        )


class ServiceHistoryListView(generics.ListAPIView):
    serializer_class = ServiceHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        request_id = self.request.query_params.get("service_request_id")
        queryset = ServiceHistory.objects.all().select_related("service_request", "updated_by")

        if request_id:
            queryset = queryset.filter(service_request_id=request_id)

        if user.role == "CUSTOMER":
            queryset = queryset.filter(service_request__customer=user)
        elif user.role == "ENGINEER":
            queryset = queryset.filter(service_request__assigned_engineer=user)

        return queryset.order_by("-created_at")
