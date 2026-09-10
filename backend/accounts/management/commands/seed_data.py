import datetime
from django.core.management.base import BaseCommand
from django.utils import timezone
from accounts.models import User, CustomerProfile, EngineerProfile
from vehicles.models import Car
from services.models import ServiceCategory, ServiceRequest, ServiceHistory
from invoices.models import Invoice, Payment
from notifications.models import Notification


class Command(BaseCommand):
    help = "Seeds database with initial production-like data (Admin, Engineers, Customers, Cars, Services, Invoices)"

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.WARNING("Starting CSMS database seed process..."))

        # 1. Create Admin
        admin_user, created = User.objects.get_or_create(
            email="admin@csms.com",
            defaults={
                "full_name": "Chief Administrator",
                "phone": "+1-800-555-0199",
                "role": "ADMIN",
                "is_staff": True,
                "is_superuser": True,
                "is_active": True,
            },
        )
        if created:
            admin_user.set_password("Admin@123")
            admin_user.save()
            self.stdout.write(self.style.SUCCESS("[OK] Admin created: admin@csms.com"))

        # 2. Create Service Categories
        categories_data = [
            ("General Service", "Complete multi-point vehicle health check, fluids top-up, and tune-up.", 150.00, "2-3 hours"),
            ("Oil & Filter Change", "High-performance synthetic oil replacement with premium OEM oil filter.", 75.00, "1 hour"),
            ("Brake System Service", "Brake pads inspection, rotor resurfacing, and brake fluid flushing.", 220.00, "2-3 hours"),
            ("Engine Diagnostic & Repair", "Computerized engine scanning, spark plug check, and powertrain maintenance.", 650.00, "1-2 days"),
            ("Air Conditioning Service", "Refrigerant recharge, cabin air filter replacement, and condenser cleaning.", 140.00, "2 hours"),
            ("Battery Replacement & Test", "Heavy-duty AGM battery installation and alternator charging test.", 180.00, "1 hour"),
            ("Wheel Alignment & Tyre Service", "Laser 4-wheel alignment, computer wheel balancing, and tyre rotation.", 110.00, "2 hours"),
            ("Full Vehicle Inspection", "120-point comprehensive pre-purchase and road-safety inspection report.", 120.00, "2-3 hours"),
            ("Electrical & Hybrid Diagnostics", "High-voltage system safety check, sensor diagnostic, and wiring repairs.", 380.00, "3-5 hours"),
            ("Car Detailing & Wash", "Interior steam cleaning, leather conditioning, and exterior ceramic coat wash.", 95.00, "3 hours"),
        ]

        cat_objs = {}
        for name, desc, cost, duration in categories_data:
            cat, _ = ServiceCategory.objects.get_or_create(
                name=name,
                defaults={
                    "description": desc,
                    "estimated_cost": cost,
                    "estimated_duration": duration,
                    "is_active": True,
                },
            )
            cat_objs[name] = cat
        self.stdout.write(self.style.SUCCESS(f"[OK] {len(cat_objs)} Service Categories seeded."))

        # 3. Create Engineers
        engineers_data = [
            ("john.engineer@csms.com", "Johnathan Reynolds", "+1-800-555-0201", "ENG-101", "Engine & Transmission Specialist", 8),
            ("sarah.engineer@csms.com", "Sarah Jenkins", "+1-800-555-0202", "ENG-102", "Electrical, Hybrid & Diagnostic Systems", 6),
        ]

        engineer_users = []
        for email, name, phone, emp_id, spec, exp in engineers_data:
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    "full_name": name,
                    "phone": phone,
                    "role": "ENGINEER",
                    "is_active": True,
                },
            )
            if created:
                user.set_password("Engineer@123")
                user.save()
            EngineerProfile.objects.get_or_create(
                user=user,
                defaults={
                    "employee_id": emp_id,
                    "specialization": spec,
                    "experience_years": exp,
                    "joining_date": datetime.date(2022, 3, 15),
                    "availability_status": "AVAILABLE",
                },
            )
            engineer_users.append(user)
        self.stdout.write(self.style.SUCCESS("[OK] 2 Service Engineers created."))

        # 4. Create Customers
        customers_data = [
            ("alex.customer@example.com", "Alex Thompson", "+1-555-234-1001", "1042 Elm Street", "Seattle", "WA", "98101"),
            ("emily.customer@example.com", "Emily Watson", "+1-555-234-1002", "724 Oak Avenue", "San Francisco", "CA", "94102"),
            ("michael.customer@example.com", "Michael Chang", "+1-555-234-1003", "350 Pine Boulevard", "Austin", "TX", "78701"),
            ("sophia.customer@example.com", "Sophia Rodriguez", "+1-555-234-1004", "882 Maple Road", "Denver", "CO", "80201"),
            ("david.customer@example.com", "David Miller", "+1-555-234-1005", "516 Lakeview Court", "Chicago", "IL", "60601"),
        ]

        customer_users = []
        for email, name, phone, addr, city, state, pin in customers_data:
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    "full_name": name,
                    "phone": phone,
                    "role": "CUSTOMER",
                    "is_active": True,
                },
            )
            if created:
                user.set_password("Customer@123")
                user.save()
            CustomerProfile.objects.get_or_create(
                user=user,
                defaults={
                    "address": addr,
                    "city": city,
                    "state": state,
                    "pincode": pin,
                },
            )
            customer_users.append(user)
        self.stdout.write(self.style.SUCCESS("[OK] 5 Customers created."))

        # 5. Create Cars
        cars_data = [
            (customer_users[0], "Toyota", "Camry Hybrid", "WA-789-ABC", 2022, "HYBRID", "Celestial Silver", 24500, "4T1B11HK5NU123456"),
            (customer_users[0], "Ford", "F-150 SuperCrew", "WA-456-XYZ", 2020, "PETROL", "Oxford White", 58000, "1FTFW1E84LFA98765"),
            (customer_users[1], "Tesla", "Model 3 Long Range", "CA-992-TES", 2023, "ELECTRIC", "Deep Blue Metallic", 16800, "5YJ3E1EB5NF554433"),
            (customer_users[2], "BMW", "330i xDrive", "TX-330-BMW", 2021, "PETROL", "Mineral Grey", 34200, "WBA5R1C51KAH11223"),
            (customer_users[3], "Honda", "CR-V AWD", "CO-441-HON", 2022, "PETROL", "Sonic Gray", 29400, "7FARW2H84NE223344"),
            (customer_users[4], "Audi", "Q5 Quattro", "IL-606-AUD", 2021, "DIESEL", "Mythos Black", 41000, "WA1BNAFY9M2998877"),
        ]

        car_objs = []
        for cust, brand, model, reg, year, fuel, color, mileage, vin in cars_data:
            car, _ = Car.objects.get_or_create(
                registration_number=reg,
                defaults={
                    "customer": cust,
                    "brand": brand,
                    "model": model,
                    "manufacturing_year": year,
                    "fuel_type": fuel,
                    "color": color,
                    "mileage": mileage,
                    "vin_number": vin,
                },
            )
            car_objs.append(car)
        self.stdout.write(self.style.SUCCESS(f"[OK] {len(car_objs)} Customer Cars registered."))

        # 6. Create Service Requests with detailed histories
        today = timezone.now().date()
        requests_specs = [
            {
                "customer": customer_users[0],
                "car": car_objs[0],
                "category": cat_objs["General Service"],
                "engineer": engineer_users[0],
                "status": "COMPLETED",
                "pref_date": today - datetime.timedelta(days=7),
                "pref_time": "09:00 AM",
                "desc": "Scheduled 25,000 km routine maintenance and comprehensive inspection.",
                "est_cost": 150.00,
                "final_cost": 165.00,
                "history": [
                    ("PENDING", "Booking confirmed by customer.", customer_users[0]),
                    ("ASSIGNED", "Assigned to Lead Diagnostic Engineer.", admin_user),
                    ("IN_PROGRESS", "Service technician commenced initial diagnostic scan.", engineer_users[0]),
                    ("INSPECTION", "Fluid levels and brake wear analyzed. Washer fluid topped up.", engineer_users[0]),
                    ("REPAIRING", "Replaced cabin pollen filter and engine air filter.", engineer_users[0]),
                    ("TESTING", "Road test and safety validation passed 100%.", engineer_users[0]),
                    ("COMPLETED", "Service fully completed and vehicle sanitized.", engineer_users[0]),
                ],
                "create_invoice": True,
                "invoice_paid": True,
            },
            {
                "customer": customer_users[1],
                "car": car_objs[2],
                "category": cat_objs["Electrical & Hybrid Diagnostics"],
                "engineer": engineer_users[1],
                "status": "TESTING",
                "pref_date": today - datetime.timedelta(days=1),
                "pref_time": "11:00 AM",
                "desc": "High voltage battery coolant warning light inspection and sensor calibration.",
                "est_cost": 380.00,
                "final_cost": 380.00,
                "history": [
                    ("PENDING", "Service booked online.", customer_users[1]),
                    ("ASSIGNED", "Assigned to Certified EV Engineer Sarah Jenkins.", admin_user),
                    ("IN_PROGRESS", "Telemetry computer connected for DTC fault code readout.", engineer_users[1]),
                    ("INSPECTION", "Thermal management sensors inspected. Coolant temperature verified.", engineer_users[1]),
                    ("REPAIRING", "Recalibrated auxiliary temperature sensor harness.", engineer_users[1]),
                    ("TESTING", "Running fast-charge diagnostic simulation cycle.", engineer_users[1]),
                ],
                "create_invoice": False,
                "invoice_paid": False,
            },
            {
                "customer": customer_users[2],
                "car": car_objs[3],
                "category": cat_objs["Brake System Service"],
                "engineer": engineer_users[0],
                "status": "IN_PROGRESS",
                "pref_date": today,
                "pref_time": "10:30 AM",
                "desc": "Front brake squeal during low speed braking. Requested ceramic pad upgrade.",
                "est_cost": 220.00,
                "final_cost": 240.00,
                "history": [
                    ("PENDING", "Service request logged.", customer_users[2]),
                    ("ASSIGNED", "Assigned to engineer John Reynolds.", admin_user),
                    ("IN_PROGRESS", "Vehicle mounted onto hydraulic lift for rotor measurement.", engineer_users[0]),
                ],
                "create_invoice": False,
                "invoice_paid": False,
            },
            {
                "customer": customer_users[3],
                "car": car_objs[4],
                "category": cat_objs["Oil & Filter Change"],
                "engineer": None,
                "status": "PENDING",
                "pref_date": today + datetime.timedelta(days=2),
                "pref_time": "02:00 PM",
                "desc": "Regular seasonal synthetic motor oil change and tyre pressure adjustment.",
                "est_cost": 75.00,
                "final_cost": 75.00,
                "history": [
                    ("PENDING", "Service booking submitted by customer.", customer_users[3]),
                ],
                "create_invoice": False,
                "invoice_paid": False,
            },
            {
                "customer": customer_users[4],
                "car": car_objs[5],
                "category": cat_objs["Air Conditioning Service"],
                "engineer": engineer_users[1],
                "status": "COMPLETED",
                "pref_date": today - datetime.timedelta(days=4),
                "pref_time": "01:00 PM",
                "desc": "AC not blowing cold air. System check and refrigerant recharge.",
                "est_cost": 140.00,
                "final_cost": 140.00,
                "history": [
                    ("PENDING", "Requested AC service.", customer_users[4]),
                    ("ASSIGNED", "Assigned to AC Specialist.", admin_user),
                    ("IN_PROGRESS", "Evacuation of old refrigerant completed.", engineer_users[1]),
                    ("INSPECTION", "UV dye vacuum pressure test showed zero leaks.", engineer_users[1]),
                    ("REPAIRING", "Recharged with 650g R134a refrigerant.", engineer_users[1]),
                    ("TESTING", "Vent output temperature measured at 4.2 C (Optimal).", engineer_users[1]),
                    ("COMPLETED", "AC overhaul completed successfully.", engineer_users[1]),
                ],
                "create_invoice": True,
                "invoice_paid": True,
            },
            {
                "customer": customer_users[0],
                "car": car_objs[1],
                "category": cat_objs["Wheel Alignment & Tyre Service"],
                "engineer": engineer_users[0],
                "status": "ASSIGNED",
                "pref_date": today + datetime.timedelta(days=1),
                "pref_time": "03:30 PM",
                "desc": "Slight pull to the right on highway driving. 4-wheel alignment needed.",
                "est_cost": 110.00,
                "final_cost": 110.00,
                "history": [
                    ("PENDING", "Booking created.", customer_users[0]),
                    ("ASSIGNED", "Engineer assigned for tomorrow's shift.", admin_user),
                ],
                "create_invoice": False,
                "invoice_paid": False,
            },
        ]

        for spec in requests_specs:
            sr, created = ServiceRequest.objects.get_or_create(
                customer=spec["customer"],
                car=spec["car"],
                service_category=spec["category"],
                preferred_date=spec["pref_date"],
                defaults={
                    "assigned_engineer": spec["engineer"],
                    "current_status": spec["status"],
                    "preferred_time": spec["pref_time"],
                    "description": spec["desc"],
                    "estimated_cost": spec["est_cost"],
                    "final_cost": spec["final_cost"],
                    "current_mileage": spec["car"].mileage,
                },
            )

            # Create history steps if newly created
            if created:
                prev = None
                for step_status, remark, upd_user in spec["history"]:
                    ServiceHistory.objects.create(
                        service_request=sr,
                        previous_status=prev,
                        new_status=step_status,
                        updated_by=upd_user,
                        remarks=remark,
                    )
                    prev = step_status

                # Create Invoice if flagged
                if spec.get("create_invoice"):
                    subtotal = sr.final_cost
                    tax = round(float(subtotal) * 0.18, 2)
                    total = round(float(subtotal) + tax, 2)
                    inv = Invoice.objects.create(
                        service_request=sr,
                        customer=sr.customer,
                        subtotal=subtotal,
                        tax=tax,
                        discount=0.00,
                        total_amount=total,
                        payment_status="PAID" if spec.get("invoice_paid") else "PENDING",
                    )
                    if spec.get("invoice_paid"):
                        Payment.objects.create(
                            invoice=inv,
                            amount=total,
                            payment_method="CARD",
                            transaction_reference=f"TXN-{inv.invoice_number[-5:]}-998",
                            payment_status="COMPLETED",
                        )

                # Notifications
                Notification.objects.create(
                    user=sr.customer,
                    title="Service Status Updated",
                    message=f"Your request {sr.request_number} current status is now {sr.current_status}.",
                    notification_type="STATUS_UPDATE",
                    is_read=False,
                )

        self.stdout.write(self.style.SUCCESS("[OK] Service requests, timelines, invoices, and payments seeded successfully."))
        self.stdout.write(self.style.SUCCESS("=================================================="))
        self.stdout.write(self.style.SUCCESS("CSMS SAMPLE CREDENTIALS READY:"))
        self.stdout.write("ADMIN:     admin@csms.com / Admin@123")
        self.stdout.write("ENGINEER:  john.engineer@csms.com / Engineer@123")
        self.stdout.write("ENGINEER:  sarah.engineer@csms.com / Engineer@123")
        self.stdout.write("CUSTOMER:  alex.customer@example.com / Customer@123")
        self.stdout.write("CUSTOMER:  emily.customer@example.com / Customer@123")
        self.stdout.write(self.style.SUCCESS("=================================================="))
