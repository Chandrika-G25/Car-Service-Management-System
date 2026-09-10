import random
from django.db import models
from django.conf import settings
from django.utils import timezone


class Invoice(models.Model):
    PAYMENT_STATUS_CHOICES = (
        ("PENDING", "Pending"),
        ("PAID", "Paid"),
        ("PARTIAL", "Partially Paid"),
        ("CANCELLED", "Cancelled"),
    )

    invoice_number = models.CharField(max_length=50, unique=True, db_index=True, blank=True)
    service_request = models.OneToOneField(
        "services.ServiceRequest",
        on_delete=models.CASCADE,
        related_name="invoice",
    )
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="invoices",
    )
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default="PENDING")
    issued_date = models.DateField(default=timezone.now)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Invoice"
        verbose_name_plural = "Invoices"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.invoice_number} - {self.customer.full_name} (${self.total_amount})"

    def save(self, *args, **kwargs):
        if not self.invoice_number:
            year = timezone.now().year
            last_inv = Invoice.objects.filter(invoice_number__startswith=f"INV-{year}-").order_by("-id").first()
            if last_inv and last_inv.invoice_number:
                try:
                    last_num = int(last_inv.invoice_number.split("-")[-1])
                    seq = str(last_num + 1).zfill(5)
                except ValueError:
                    seq = str(random.randint(10000, 99999))
            else:
                seq = "00001"
            self.invoice_number = f"INV-{year}-{seq}"

        if not self.total_amount:
            self.total_amount = (self.subtotal + self.tax) - self.discount

        super().save(*args, **kwargs)


class Payment(models.Model):
    METHOD_CHOICES = (
        ("CASH", "Cash"),
        ("CARD", "Credit/Debit Card"),
        ("UPI", "UPI"),
        ("BANK_TRANSFER", "Bank Transfer"),
    )

    STATUS_CHOICES = (
        ("COMPLETED", "Completed"),
        ("PENDING", "Pending"),
        ("FAILED", "Failed"),
    )

    invoice = models.ForeignKey(
        Invoice,
        on_delete=models.CASCADE,
        related_name="payments",
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=30, choices=METHOD_CHOICES, default="CASH")
    transaction_reference = models.CharField(max_length=100, blank=True, null=True)
    payment_date = models.DateTimeField(default=timezone.now)
    payment_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="COMPLETED")

    class Meta:
        verbose_name = "Payment"
        verbose_name_plural = "Payments"
        ordering = ["-payment_date"]

    def __str__(self):
        return f"Payment of ${self.amount} for {self.invoice.invoice_number} ({self.payment_method})"
