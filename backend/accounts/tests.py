from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from accounts.models import User
from vehicles.models import Car
from services.models import ServiceCategory, ServiceRequest, ServiceHistory
from invoices.models import Invoice


class CSMSTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Admin user
        self.admin = User.objects.create_superuser(
            email="testadmin@csms.com",
            password="Password@123",
            full_name="Admin Tester",
        )

        # Customer user
        self.customer = User.objects.create_user(
            email="testcustomer@csms.com",
            password="Password@123",
            full_name="Customer Tester",
            role="CUSTOMER",
        )

        # Engineer user
        self.engineer = User.objects.create_user(
            email="testengineer@csms.com",
            password="Password@123",
            full_name="Engineer Tester",
            role="ENGINEER",
        )
        from accounts.models import EngineerProfile
        EngineerProfile.objects.create(
            user=self.engineer,
            employee_id="TEST-ENG-01",
            specialization="General Inspection",
        )

        # Service Category
        self.category = ServiceCategory.objects.create(
            name="Test Diagnostic",
            estimated_cost=100.00,
            estimated_duration="1 hour",
        )

        # Car for customer
        self.car = Car.objects.create(
            customer=self.customer,
            brand="Honda",
            model="Civic",
            registration_number="TEST-999-XYZ",
            manufacturing_year=2021,
            fuel_type="PETROL",
            mileage=15000,
        )

    def test_customer_registration(self):
        url = reverse("auth-register")
        data = {
            "full_name": "New Customer",
            "email": "newbie@example.com",
            "phone": "+1-555-111-2222",
            "password": "SecurePassword123",
            "confirm_password": "SecurePassword123",
            "address": "123 Test Way",
            "city": "Dallas",
            "state": "TX",
            "pincode": "75001",
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email="newbie@example.com").exists())
        self.assertIn("tokens", response.data)

    def test_login_and_jwt_tokens(self):
        url = reverse("auth-login")
        data = {
            "email": "testcustomer@csms.com",
            "password": "Password@123",
            "role": "CUSTOMER",
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("tokens", response.data)
        self.assertIn("access", response.data["tokens"])
        self.assertEqual(response.data["user"]["role"], "CUSTOMER")

    def test_role_enforcement_on_login(self):
        url = reverse("auth-login")
        # Customer attempting to log in via Admin portal
        data = {
            "email": "testcustomer@csms.com",
            "password": "Password@123",
            "role": "ADMIN",
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_car_crud_for_customer(self):
        self.client.force_authenticate(user=self.customer)
        # Create car
        url = reverse("car-list-create")
        data = {
            "brand": "Toyota",
            "model": "Corolla",
            "registration_number": "REG-123-TEST",
            "manufacturing_year": 2022,
            "fuel_type": "PETROL",
            "mileage": 12000,
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # List cars
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check customer can only see their cars
        for car in response.data["results"] if "results" in response.data else response.data:
            self.assertEqual(car["customer"], self.customer.id)

    def test_service_request_workflow(self):
        # 1. Customer creates service request
        self.client.force_authenticate(user=self.customer)
        url = reverse("service-requests-list-create")
        data = {
            "car_id": self.car.id,
            "service_category_id": self.category.id,
            "preferred_date": "2026-10-15",
            "preferred_time": "10:00 AM",
            "description": "Oil check and diagnostic",
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        request_id = response.data["id"]
        self.assertEqual(response.data["current_status"], "PENDING")

        # 2. Admin assigns engineer
        self.client.force_authenticate(user=self.admin)
        assign_url = reverse("admin-service-request-assign", kwargs={"pk": request_id})
        assign_resp = self.client.put(
            assign_url,
            {"engineer_id": self.engineer.id, "remarks": "Assigned to test engineer"},
            format="json",
        )
        self.assertEqual(assign_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(assign_resp.data["service"]["current_status"], "ASSIGNED")

        # 3. Engineer updates status to IN_PROGRESS
        self.client.force_authenticate(user=self.engineer)
        status_url = reverse("engineer-service-status", kwargs={"pk": request_id})
        progress_resp = self.client.put(
            status_url,
            {"status": "IN_PROGRESS", "remarks": "Starting inspection now"},
            format="json",
        )
        self.assertEqual(progress_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(progress_resp.data["service"]["current_status"], "IN_PROGRESS")

        # 4. Engineer completes service
        comp_resp = self.client.put(
            status_url,
            {"status": "COMPLETED", "remarks": "Work completed and tested", "final_cost": 120.00},
            format="json",
        )
        self.assertEqual(comp_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(comp_resp.data["service"]["current_status"], "COMPLETED")

        # Verify auto-generated invoice on completion
        self.assertTrue(Invoice.objects.filter(service_request_id=request_id).exists())
