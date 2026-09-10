from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils import timezone


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email).lower()
        extra_fields.setdefault("role", "CUSTOMER")
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("role", "ADMIN")
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ("ADMIN", "Admin"),
        ("CUSTOMER", "Customer"),
        ("ENGINEER", "Service Engineer"),
    )

    full_name = models.CharField(max_length=150)
    email = models.EmailField(unique=True, db_index=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="CUSTOMER")
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["full_name"]

    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.full_name} ({self.email}) - {self.role}"


class CustomerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="customer_profile")
    address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    pincode = models.CharField(max_length=20, blank=True, null=True)
    profile_image = models.ImageField(upload_to="profiles/customers/", blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Customer: {self.user.full_name} - {self.city or 'N/A'}"


class EngineerProfile(models.Model):
    AVAILABILITY_CHOICES = (
        ("AVAILABLE", "Available"),
        ("BUSY", "Busy"),
        ("ON_LEAVE", "On Leave"),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="engineer_profile")
    employee_id = models.CharField(max_length=50, unique=True)
    specialization = models.CharField(max_length=150, blank=True, null=True)
    experience_years = models.PositiveIntegerField(default=0)
    joining_date = models.DateField(blank=True, null=True)
    availability_status = models.CharField(max_length=20, choices=AVAILABILITY_CHOICES, default="AVAILABLE")
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Eng: {self.employee_id} - {self.user.full_name} ({self.specialization})"
