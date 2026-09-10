from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, CustomerProfile, EngineerProfile


class CustomerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerProfile
        fields = ["id", "address", "city", "state", "pincode", "profile_image", "created_at", "updated_at"]


class EngineerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = EngineerProfile
        fields = ["id", "employee_id", "specialization", "experience_years", "joining_date", "availability_status", "created_at", "updated_at"]


class UserSerializer(serializers.ModelSerializer):
    customer_profile = CustomerProfileSerializer(read_only=True)
    engineer_profile = EngineerProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ["id", "full_name", "email", "phone", "role", "is_active", "created_at", "updated_at", "customer_profile", "engineer_profile"]
        read_only_fields = ["id", "role", "created_at", "updated_at"]


class CustomerRegistrationSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=150, required=True)
    email = serializers.EmailField(required=True)
    phone = serializers.CharField(max_length=20, required=True)
    password = serializers.CharField(write_only=True, required=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True, required=True)
    address = serializers.CharField(required=False, allow_blank=True, default="")
    city = serializers.CharField(max_length=100, required=False, allow_blank=True, default="")
    state = serializers.CharField(max_length=100, required=False, allow_blank=True, default="")
    pincode = serializers.CharField(max_length=20, required=False, allow_blank=True, default="")

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value.lower()

    def validate(self, data):
        if data.get("password") != data.get("confirm_password"):
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return data

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            full_name=validated_data["full_name"],
            phone=validated_data.get("phone", ""),
            role="CUSTOMER",
        )
        CustomerProfile.objects.create(
            user=user,
            address=validated_data.get("address", ""),
            city=validated_data.get("city", ""),
            state=validated_data.get("state", ""),
            pincode=validated_data.get("pincode", ""),
        )
        return user


class AdminCreateEngineerSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=150, required=True)
    email = serializers.EmailField(required=True)
    phone = serializers.CharField(max_length=20, required=True)
    password = serializers.CharField(write_only=True, required=True, min_length=6)
    employee_id = serializers.CharField(max_length=50, required=True)
    specialization = serializers.CharField(max_length=150, required=False, allow_blank=True, default="")
    experience_years = serializers.IntegerField(required=False, default=0, min_value=0)
    joining_date = serializers.DateField(required=False, allow_null=True)

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value.lower()

    def validate_employee_id(self, value):
        if EngineerProfile.objects.filter(employee_id__iexact=value).exists():
            raise serializers.ValidationError("An engineer with this Employee ID already exists.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            full_name=validated_data["full_name"],
            phone=validated_data.get("phone", ""),
            role="ENGINEER",
        )
        EngineerProfile.objects.create(
            user=user,
            employee_id=validated_data["employee_id"],
            specialization=validated_data.get("specialization", ""),
            experience_years=validated_data.get("experience_years", 0),
            joining_date=validated_data.get("joining_date", None),
            availability_status="AVAILABLE",
        )
        return user


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=6)
    confirm_new_password = serializers.CharField(required=True)

    def validate(self, data):
        if data["new_password"] != data["confirm_new_password"]:
            raise serializers.ValidationError({"confirm_new_password": "New passwords do not match."})
        return data
