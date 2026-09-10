from rest_framework import views, permissions, status
from rest_framework.response import Response
from django.db.models import Count, Sum, Q
from django.utils import timezone
from datetime import timedelta
from accounts.models import User
from vehicles.models import Car
from services.models import ServiceRequest, ServiceCategory
from invoices.models import Invoice, Payment
from notifications.models import Notification
from accounts.permissions import IsAdminUserRole, IsEngineerUserRole


class AdminDashboardAnalyticsView(views.APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        now = timezone.now()

        # Summary KPIs
        total_customers = User.objects.filter(role="CUSTOMER").count()
        total_vehicles = Car.objects.count()
        total_engineers = User.objects.filter(role="ENGINEER").count()

        pending_services = ServiceRequest.objects.filter(current_status="PENDING").count()
        active_statuses = ["ASSIGNED", "IN_PROGRESS", "INSPECTION", "REPAIRING", "TESTING"]
        active_services = ServiceRequest.objects.filter(current_status__in=active_statuses).count()
        completed_services = ServiceRequest.objects.filter(current_status="COMPLETED").count()
        cancelled_services = ServiceRequest.objects.filter(current_status="CANCELLED").count()

        # Revenue
        total_revenue = Invoice.objects.filter(payment_status__in=["PAID", "PARTIAL"]).aggregate(Sum("total_amount"))["total_amount__sum"] or 0
        total_paid_cash = Payment.objects.filter(payment_status="COMPLETED").aggregate(Sum("amount"))["amount__sum"] or 0

        # Status distribution for Doughnut chart
        status_counts = dict(
            ServiceRequest.objects.values("current_status")
            .annotate(count=Count("id"))
            .values_list("current_status", "count")
        )
        all_statuses = ["PENDING", "ASSIGNED", "IN_PROGRESS", "INSPECTION", "REPAIRING", "TESTING", "COMPLETED", "CANCELLED"]
        status_distribution = {st: status_counts.get(st, 0) for st in all_statuses}

        # Popular Service Categories
        category_data = (
            ServiceCategory.objects.annotate(req_count=Count("service_requests"))
            .filter(req_count__gt=0)
            .order_by("-req_count")[:6]
        )
        popular_categories = [
            {"name": c.name, "count": c.req_count, "cost": float(c.estimated_cost)}
            for c in category_data
        ]

        # Monthly service volume & revenue (last 6 months)
        monthly_services = []
        monthly_revenue = []
        month_labels = []

        for i in range(5, -1, -1):
            start_date = (now - timedelta(days=i * 30)).replace(day=1, hour=0, minute=0, second=0)
            if i > 0:
                end_date = (now - timedelta(days=(i - 1) * 30)).replace(day=1, hour=0, minute=0, second=0)
            else:
                end_date = now + timedelta(days=1)

            month_label = start_date.strftime("%b %Y")
            month_labels.append(month_label)

            m_count = ServiceRequest.objects.filter(created_at__gte=start_date, created_at__lt=end_date).count()
            monthly_services.append(m_count)

            m_rev = Invoice.objects.filter(
                payment_status="PAID",
                created_at__gte=start_date,
                created_at__lt=end_date
            ).aggregate(Sum("total_amount"))["total_amount__sum"] or 0
            monthly_revenue.append(float(m_rev))

        # Engineer workload
        engineers_workload = []
        engineers = User.objects.filter(role="ENGINEER").select_related("engineer_profile")
        for eng in engineers:
            assigned = ServiceRequest.objects.filter(assigned_engineer=eng, current_status__in=active_statuses).count()
            completed = ServiceRequest.objects.filter(assigned_engineer=eng, current_status="COMPLETED").count()
            engineers_workload.append({
                "id": eng.id,
                "name": eng.full_name,
                "employee_id": getattr(eng.engineer_profile, "employee_id", "N/A"),
                "specialization": getattr(eng.engineer_profile, "specialization", "General"),
                "status": getattr(eng.engineer_profile, "availability_status", "AVAILABLE"),
                "active_jobs": assigned,
                "completed_jobs": completed,
            })

        # Recent service requests
        from services.serializers import ServiceRequestSerializer
        recent_requests = ServiceRequest.objects.all().select_related(
            "customer", "car", "service_category", "assigned_engineer"
        ).order_by("-created_at")[:6]

        from accounts.serializers import UserSerializer
        recent_customers = User.objects.filter(role="CUSTOMER").select_related("customer_profile").order_by("-created_at")[:6]

        return Response({
            "kpis": {
                "total_customers": total_customers,
                "total_vehicles": total_vehicles,
                "total_engineers": total_engineers,
                "pending_services": pending_services,
                "active_services": active_services,
                "completed_services": completed_services,
                "cancelled_services": cancelled_services,
                "total_revenue": float(total_revenue),
                "total_paid_collected": float(total_paid_cash),
            },
            "charts": {
                "status_distribution": status_distribution,
                "popular_categories": popular_categories,
                "monthly_labels": month_labels,
                "monthly_services": monthly_services,
                "monthly_revenue": monthly_revenue,
            },
            "engineers_workload": engineers_workload,
            "recent_requests": ServiceRequestSerializer(recent_requests, many=True).data,
            "recent_customers": UserSerializer(recent_customers, many=True).data,
        }, status=status.HTTP_200_OK)


class CustomerDashboardAnalyticsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role != "CUSTOMER":
            return Response({"error": "Unauthorized access"}, status=status.HTTP_403_FORBIDDEN)

        total_cars = Car.objects.filter(customer=user).count()
        requests = ServiceRequest.objects.filter(customer=user)

        active_statuses = ["ASSIGNED", "IN_PROGRESS", "INSPECTION", "REPAIRING", "TESTING"]
        active_count = requests.filter(current_status__in=active_statuses).count()
        completed_count = requests.filter(current_status="COMPLETED").count()
        pending_count = requests.filter(current_status="PENDING").count()

        unread_notifications = Notification.objects.filter(user=user, is_read=False).count()

        from services.serializers import ServiceRequestSerializer
        recent_requests = requests.select_related("car", "service_category", "assigned_engineer").order_by("-created_at")[:5]

        # Upcoming active service (for prominent progress card)
        upcoming_active = requests.filter(current_status__in=active_statuses + ["PENDING"]).select_related("car", "service_category", "assigned_engineer").order_by("-updated_at").first()

        return Response({
            "kpis": {
                "total_cars": total_cars,
                "active_services": active_count,
                "completed_services": completed_count,
                "pending_services": pending_count,
                "unread_notifications": unread_notifications,
            },
            "recent_requests": ServiceRequestSerializer(recent_requests, many=True).data,
            "current_active_service": ServiceRequestSerializer(upcoming_active).data if upcoming_active else None,
        }, status=status.HTTP_200_OK)


class EngineerDashboardAnalyticsView(views.APIView):
    permission_classes = [IsEngineerUserRole]

    def get(self, request):
        user = request.user
        today = timezone.now().date()

        assigned_qs = ServiceRequest.objects.filter(assigned_engineer=user)

        assigned_count = assigned_qs.filter(current_status="ASSIGNED").count()
        in_progress_count = assigned_qs.filter(current_status__in=["IN_PROGRESS", "INSPECTION", "REPAIRING", "TESTING"]).count()
        completed_today = assigned_qs.filter(current_status="COMPLETED", updated_at__date=today).count()
        total_completed = assigned_qs.filter(current_status="COMPLETED").count()

        from services.serializers import ServiceRequestSerializer
        active_jobs = assigned_qs.filter(current_status__in=["ASSIGNED", "IN_PROGRESS", "INSPECTION", "REPAIRING", "TESTING"]).select_related("customer", "car", "service_category").order_by("preferred_date")

        return Response({
            "kpis": {
                "assigned_jobs": assigned_count,
                "in_progress_jobs": in_progress_count,
                "completed_today": completed_today,
                "total_completed": total_completed,
            },
            "active_jobs": ServiceRequestSerializer(active_jobs, many=True).data,
        }, status=status.HTTP_200_OK)
