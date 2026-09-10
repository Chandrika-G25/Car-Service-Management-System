from django.db import models
from django.conf import settings
from django.utils import timezone


class Car(models.Model):
    FUEL_CHOICES = (
        ("PETROL", "Petrol"),
        ("DIESEL", "Diesel"),
        ("ELECTRIC", "Electric"),
        ("HYBRID", "Hybrid"),
        ("CNG", "CNG"),
    )

    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="cars",
    )
    brand = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    registration_number = models.CharField(max_length=50, unique=True, db_index=True)
    manufacturing_year = models.PositiveIntegerField()
    fuel_type = models.CharField(max_length=20, choices=FUEL_CHOICES, default="PETROL")
    color = models.CharField(max_length=50, blank=True, null=True)
    mileage = models.PositiveIntegerField(help_text="Current odometer mileage in km", default=0)
    vin_number = models.CharField(max_length=50, blank=True, null=True)
    image = models.ImageField(upload_to="cars/", blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Car"
        verbose_name_plural = "Cars"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.brand} {self.model} ({self.registration_number}) - {self.customer.full_name}"
