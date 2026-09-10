# Smart Car Service Management System (CSMS) - Technical Specification Document

---

## 1. Introduction
The **Smart Car Service Management System (CSMS)** is an end-to-end web software platform designed to manage complete operational lifecycles for automobile workshops, dealership service bays, and independent vehicle repair centers. It standardizes communication between vehicle owners, certified repair technicians, and workshop management through a secure, auditable, and automated digital process.

---

## 2. Problem Statement
Traditional automotive repair garages rely heavily on handwritten paperwork, verbal updates, and unstructured phone communication. This leads to:
1. **Lack of Transparency**: Vehicle owners rarely know what stage their automobile is in (intake, disassembly, inspection, or waiting for parts).
2. **Billing Surprises**: Unclear or unexpected fee inflations cause customer friction.
3. **Inefficient Bay Allocation**: Workshop managers struggle to track which technician is working on which vehicle.
4. **Scattered Historical Records**: Service history is frequently lost, diminishing vehicle resale value and obscuring recurring mechanical defects.

---

## 3. Proposed Solution
CSMS provides a centralized, role-based platform built with **Django REST Framework**, **ReactJS**, and **Microsoft SQL Server**:
- **Automated Service State Machine**: Guarantees sequential tracking through 7 distinct milestones (`PENDING` → `ASSIGNED` → `IN_PROGRESS` → `INSPECTION` → `REPAIRING` → `TESTING` → `COMPLETED`).
- **Granular Role Portals**: Independent, branded interfaces for Customers, Service Engineers, and Workshop Administrators.
- **Audit Logging**: Every action automatically records previous state, new state, user identity, and technical remarks.
- **REST-First Performance**: Standardized JSON data transport over HTTP/HTTPS with stateless JWT bearer tokens, eliminating heavy socket daemon requirements.

---

## 4. User Roles & Access Control

### 4.1 Customer
- Self-registration with email uniqueness validation.
- Vehicle registration (Plate, Brand, Model, Year, Fuel Type, Mileage, VIN).
- Appointment scheduling with preferred time slots and complaint description.
- Visual 7-stage progress tracking.
- Access to itemized digital tax invoices and receipt printing.
- Notification feed for status updates.

### 4.2 Service Engineer (Technician)
- Access strictly limited to workorder tickets assigned by administrators.
- Ability to advance service stages with diagnostic findings and observations.
- Ability to append technical repair notes (DTC error codes, micrometer readings, torque specs).
- Availability status toggle (`AVAILABLE`, `BUSY`, `ON_LEAVE`).
- Prevented from modifying user roles, customer profiles, or administrative analytics.

### 4.3 Administrator
- Supervise all workshop bays, active queues, and historical archives.
- Onboard certified technicians with custom employee IDs and specialties.
- Allocate technician resources to pending service requests.
- Adjust cost estimates and approve final billings.
- Record invoice payments (Cash, Card, UPI, Bank Transfer).
- Real-time Chart.js intelligence dashboard and financial reports.

---

## 5. Database Schema & Entity Relationships

```
+----------------+       1:N       +----------------+
|      User      | <-------------> | CustomerProfile|
+----------------+                 +----------------+
        | 1
        |
        | N
+----------------+       1:N       +----------------+
|      Car       | <-------------> | ServiceRequest |
+----------------+                 +----------------+
                                           | 1
                                           |
                                           | 1
                                   +----------------+
                                   |    Invoice     |
                                   +----------------+
                                           | 1
                                           |
                                           | N
                                   +----------------+
                                   |    Payment     |
                                   +----------------+
```

### Key Entities:
1. **`User`**: Base authentication model with role flag (`ADMIN`, `CUSTOMER`, `ENGINEER`).
2. **`CustomerProfile`**: Address, city, state, postal coordinates, profile image.
3. **`EngineerProfile`**: Unique employee ID, specialization, experience, availability status.
4. **`Car`**: Customer foreign key, unique registration number, VIN, powertrain fuel type, odometer.
5. **`ServiceCategory`**: Service package definitions with estimated duration and base fee.
6. **`ServiceRequest`**: Central workorder tracking customer, car, category, assigned technician, request number (`CSMS-YYYY-XXXXX`), status, and costs.
7. **`ServiceHistory`**: Immutable chronological audit log recording transitions, remarks, and user IDs.
8. **`Invoice`**: Tax calculations (18% standard GST/tax), subtotal, discount, payment status, invoice number (`INV-YYYY-XXXXX`).
9. **`Payment`**: Transaction records with method (`CASH`, `CARD`, `UPI`, `BANK_TRANSFER`).
10. **`Notification`**: User alerts with unread boolean flags.

---

## 6. Security & Authorization
- **JWT (JSON Web Tokens)**: Short-lived access tokens (4 hours) paired with rotatable refresh tokens (7 days).
- **Password Hashing**: Django's PBKDF2 with SHA-256 password hashing. Passwords are never stored as plaintext.
- **Custom DRF Permissions**: `IsAdminUserRole`, `IsCustomerUserRole`, `IsEngineerUserRole` enforcing least-privilege access at the API layer.
- **Environment Isolation**: Sensitive configuration (secret keys, database credentials) loaded via `.env`.
- **CORS Safeguards**: Configured via `django-cors-headers` allowing authenticated requests from verified frontend origins.

---

## 7. QA Verification Summary
All core subsystems have been validated via automated and integration test suites:
- **Unit Tests**: Ran 5 Django test cases covering user registration, JWT generation, role isolation, vehicle CRUD, and the complete 7-stage service request lifecycle (`OK`).
- **Integration Test**: Validated live HTTP responses from local server on port 8000 and 5173 with 100% success across all role endpoints.
- **Database Seeding**: Populated 1 Admin, 2 Certified Engineers, 5 Customers, 6 Vehicles, 10 Service Categories, 6 Service Requests in varied stages, and 2 Invoices with completed payments.
