import random
from django.db import models
from django.conf import settings
from django.utils import timezone


class ServiceCategory(models.Model):
    name = models.CharField(max_length=120, unique=True)
    description = models.TextField(blank=True, null=True)
    estimated_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    estimated_duration = models.CharField(max_length=100, help_text="e.g. 2-3 hours, 1 day", default="2-4 hours")
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Service Category"
        verbose_name_plural = "Service Categories"
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} (${self.estimated_cost})"


class ServiceRequest(models.Model):
    STATUS_CHOICES = (
        ("PENDING", "Pending"),
        ("ASSIGNED", "Assigned"),
        ("IN_PROGRESS", "In Progress"),
        ("INSPECTION", "Inspection"),
        ("REPAIRING", "Repairing"),
        ("TESTING", "Testing"),
        ("COMPLETED", "Completed"),
        ("CANCELLED", "Cancelled"),
    )

    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="service_requests",
    )
    car = models.ForeignKey(
        "vehicles.Car",
        on_delete=models.CASCADE,
        related_name="service_requests",
    )
    service_category = models.ForeignKey(
        ServiceCategory,
        on_delete=models.SET_NULL,
        null=True,
        related_name="service_requests",
    )
    assigned_engineer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_requests",
    )
    request_number = models.CharField(max_length=50, unique=True, db_index=True, blank=True)
    description = models.TextField(blank=True, null=True)
    preferred_date = models.DateField()
    preferred_time = models.CharField(max_length=50, help_text="e.g. 10:00 AM, Morning, Afternoon", default="10:00 AM")
    current_status = models.CharField(max_length=30, choices=STATUS_CHOICES, default="PENDING", db_index=True)
    estimated_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    final_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    current_mileage = models.PositiveIntegerField(default=0, help_text="Mileage at service booking")
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Service Request"
        verbose_name_plural = "Service Requests"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.request_number} - {self.car.brand} {self.car.model} [{self.current_status}]"

    def save(self, *args, **kwargs):
        if not self.request_number:
            year = timezone.now().year
            # Generate sequential or unique identifier
            last_req = ServiceRequest.objects.filter(request_number__startswith=f"CSMS-{year}-").order_by("-id").first()
            if last_req and last_req.request_number:
                try:
                    last_num = int(last_req.request_number.split("-")[-1])
                    seq = str(last_num + 1).zfill(5)
                except ValueError:
                    seq = str(random.randint(10000, 99999))
            else:
                seq = "00001"
            self.request_number = f"CSMS-{year}-{seq}"

        if not self.estimated_cost and self.service_category:
            self.estimated_cost = self.service_category.estimated_cost

        super().save(*args, **kwargs)


class ServiceHistory(models.Model):
    service_request = models.ForeignKey(
        ServiceRequest,
        on_delete=models.CASCADE,
        related_name="history",
    )
    previous_status = models.CharField(max_length=30, blank=True, null=True)
    new_status = models.CharField(max_length=30)
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="status_updates",
    )
    remarks = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        verbose_name = "Service History"
        verbose_name_plural = "Service Histories"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.service_request.request_number}: {self.previous_status} -> {self.new_status}"
