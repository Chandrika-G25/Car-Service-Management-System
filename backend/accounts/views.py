from rest_framework import status, permissions, generics, views
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.db.models import Q
from .models import User, CustomerProfile, EngineerProfile
from .serializers import (
    UserSerializer,
    CustomerRegistrationSerializer,
    AdminCreateEngineerSerializer,
    ChangePasswordSerializer,
)
from .permissions import IsAdminUserRole


class RegisterCustomerView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = CustomerRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response(
                {
                    "message": "Registration successful. You can now login.",
                    "user": UserSerializer(user).data,
                    "tokens": {
                        "refresh": str(refresh),
                        "access": str(refresh.access_token),
                    },
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CustomLoginView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email", "").strip().lower()
        password = request.data.get("password", "")
        expected_role = request.data.get("role")  # Optional role constraint from portal

        if not email or not password:
            return Response(
                {"error": "Please provide both email and password."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response(
                {"error": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.check_password(password):
            return Response(
                {"error": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.is_active:
            return Response(
                {"error": "Your account has been deactivated. Please contact support."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Validate role if specific login portal specified
        if expected_role and user.role != expected_role:
            return Response(
                {
                    "error": f"Unauthorized access. Your account does not have {expected_role} privileges.",
                    "actual_role": user.role,
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "message": "Login successful.",
                "tokens": {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                },
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )


class LogoutView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({"message": "Successfully logged out."}, status=status.HTTP_200_OK)
        except Exception:
            return Response({"message": "Logged out successfully."}, status=status.HTTP_200_OK)


class ProfileView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        user = request.user
        full_name = request.data.get("full_name")
        phone = request.data.get("phone")

        if full_name:
            user.full_name = full_name
        if phone is not None:
            user.phone = phone
        user.save()

        # Update customer profile if customer
        if user.role == "CUSTOMER":
            profile, _ = CustomerProfile.objects.get_or_create(user=user)
            if "address" in request.data:
                profile.address = request.data.get("address")
            if "city" in request.data:
                profile.city = request.data.get("city")
            if "state" in request.data:
                profile.state = request.data.get("state")
            if "pincode" in request.data:
                profile.pincode = request.data.get("pincode")
            if "profile_image" in request.FILES:
                profile.profile_image = request.FILES["profile_image"]
            profile.save()

        # Update engineer profile if engineer
        elif user.role == "ENGINEER":
            profile, _ = EngineerProfile.objects.get_or_create(user=user)
            if "specialization" in request.data:
                profile.specialization = request.data.get("specialization")
            if "experience_years" in request.data:
                profile.experience_years = request.data.get("experience_years")
            if "availability_status" in request.data:
                profile.availability_status = request.data.get("availability_status")
            profile.save()

        return Response(
            {"message": "Profile updated successfully.", "user": UserSerializer(user).data},
            status=status.HTTP_200_OK,
        )


class ChangePasswordView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data["old_password"]):
                return Response(
                    {"error": "Current password is incorrect."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            user.set_password(serializer.validated_data["new_password"])
            user.save()
            return Response(
                {"message": "Password changed successfully."},
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ------------------ Admin User Views ------------------ #

class AdminCustomerListView(generics.ListAPIView):
    permission_classes = [IsAdminUserRole]
    serializer_class = UserSerializer

    def get_queryset(self):
        queryset = User.objects.filter(role="CUSTOMER").select_related("customer_profile").prefetch_related("cars")
        search = self.request.query_params.get("search", "").strip()
        status_filter = self.request.query_params.get("status")

        if search:
            queryset = queryset.filter(
                Q(full_name__icontains=search) |
                Q(email__icontains=search) |
                Q(phone__icontains=search)
            )

        if status_filter is not None:
            if status_filter.lower() == "active":
                queryset = queryset.filter(is_active=True)
            elif status_filter.lower() == "inactive":
                queryset = queryset.filter(is_active=False)

        return queryset.order_by("-created_at")


class AdminCustomerDetailView(views.APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request, pk):
        try:
            customer = User.objects.select_related("customer_profile").get(pk=pk, role="CUSTOMER")
        except User.DoesNotExist:
            return Response({"error": "Customer not found."}, status=status.HTTP_404_NOT_FOUND)

        from vehicles.serializers import CarSerializer
        from services.serializers import ServiceRequestSerializer

        cars = customer.cars.all()
        services = customer.service_requests.all().order_by("-created_at")

        data = UserSerializer(customer).data
        data["cars"] = CarSerializer(cars, many=True).data
        data["service_history"] = ServiceRequestSerializer(services, many=True).data

        return Response(data, status=status.HTTP_200_OK)


class AdminToggleCustomerActiveView(views.APIView):
    permission_classes = [IsAdminUserRole]

    def put(self, request, pk):
        try:
            customer = User.objects.get(pk=pk, role="CUSTOMER")
        except User.DoesNotExist:
            return Response({"error": "Customer not found."}, status=status.HTTP_404_NOT_FOUND)

        customer.is_active = not customer.is_active
        customer.save()
        status_str = "activated" if customer.is_active else "deactivated"
        return Response(
            {"message": f"Customer account has been {status_str}.", "is_active": customer.is_active},
            status=status.HTTP_200_OK,
        )


class AdminEngineerListCreateView(views.APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        queryset = User.objects.filter(role="ENGINEER").select_related("engineer_profile")
        search = self.request.query_params.get("search", "").strip()
        status_filter = self.request.query_params.get("status")

        if search:
            queryset = queryset.filter(
                Q(full_name__icontains=search) |
                Q(email__icontains=search) |
                Q(engineer_profile__employee_id__icontains=search) |
                Q(engineer_profile__specialization__icontains=search)
            )

        if status_filter:
            queryset = queryset.filter(engineer_profile__availability_status=status_filter)

        serializer = UserSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = AdminCreateEngineerSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {"message": "Engineer account created successfully.", "user": UserSerializer(user).data},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminEngineerDetailView(views.APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request, pk):
        try:
            engineer = User.objects.select_related("engineer_profile").get(pk=pk, role="ENGINEER")
        except User.DoesNotExist:
            return Response({"error": "Engineer not found."}, status=status.HTTP_404_NOT_FOUND)

        from services.serializers import ServiceRequestSerializer
        services = engineer.assigned_requests.all().order_by("-created_at")

        data = UserSerializer(engineer).data
        data["assigned_services"] = ServiceRequestSerializer(services, many=True).data
        return Response(data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        try:
            engineer = User.objects.select_related("engineer_profile").get(pk=pk, role="ENGINEER")
        except User.DoesNotExist:
            return Response({"error": "Engineer not found."}, status=status.HTTP_404_NOT_FOUND)

        if "full_name" in request.data:
            engineer.full_name = request.data.get("full_name")
        if "phone" in request.data:
            engineer.phone = request.data.get("phone")
        if "is_active" in request.data:
            engineer.is_active = request.data.get("is_active")
        engineer.save()

        profile = engineer.engineer_profile
        if "specialization" in request.data:
            profile.specialization = request.data.get("specialization")
        if "experience_years" in request.data:
            profile.experience_years = request.data.get("experience_years")
        if "availability_status" in request.data:
            profile.availability_status = request.data.get("availability_status")
        profile.save()

        return Response(
            {"message": "Engineer profile updated successfully.", "user": UserSerializer(engineer).data},
            status=status.HTTP_200_OK,
        )
