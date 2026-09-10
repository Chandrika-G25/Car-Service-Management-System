# CSMS REST API Documentation

Comprehensive reference for all Django REST Framework endpoints in the Smart Car Service Management System.

**Base URL**: `http://127.0.0.1:8000/api`

---

## Authentication & Profiles

### 1. Customer Self-Registration
- **Endpoint**: `POST /api/auth/register/`
- **Auth**: None (Public)
- **Request Body**:
```json
{
  "full_name": "Alex Thompson",
  "email": "alex@example.com",
  "phone": "+1-555-0199",
  "password": "SecurePassword123",
  "confirm_password": "SecurePassword123",
  "address": "1042 Elm St",
  "city": "Seattle",
  "state": "WA",
  "pincode": "98101"
}
```
- **Response `201 Created`**:
```json
{
  "message": "Registration successful. You can now login.",
  "user": {
    "id": 1,
    "full_name": "Alex Thompson",
    "email": "alex@example.com",
    "phone": "+1-555-0199",
    "role": "CUSTOMER",
    "is_active": true
  },
  "tokens": {
    "access": "eyJhbGciOi...",
    "refresh": "eyJhbGciOi..."
  }
}
```

### 2. User Login
- **Endpoint**: `POST /api/auth/login/`
- **Auth**: None (Public)
- **Request Body**:
```json
{
  "email": "alex@example.com",
  "password": "SecurePassword123",
  "role": "CUSTOMER"
}
```
- **Response `200 OK`**:
```json
{
  "message": "Login successful.",
  "tokens": {
    "access": "eyJhbGciOi...",
    "refresh": "eyJhbGciOi..."
  },
  "user": {
    "id": 1,
    "full_name": "Alex Thompson",
    "email": "alex@example.com",
    "role": "CUSTOMER"
  }
}
```

### 3. Token Refresh
- **Endpoint**: `POST /api/auth/token/refresh/`
- **Request Body**: `{ "refresh": "<refresh_token>" }`
- **Response `200 OK`**: `{ "access": "<new_access_token>" }`

### 4. User Profile
- **Endpoint**: `GET /api/profile/`
- **Auth**: `Bearer <token>`
- **Response `200 OK`**: User profile with customer_profile or engineer_profile.

---

## Vehicles (`/api/cars/`)

### 1. List Vehicles
- **Endpoint**: `GET /api/cars/`
- **Auth**: `Bearer <token>`
- **Query Params**: `search`, `brand`
- **Notes**: Customers receive only their vehicles; Admins & Engineers receive all.

### 2. Register Vehicle
- **Endpoint**: `POST /api/cars/`
- **Auth**: `Bearer <token>` (Customer)
- **Request Body**:
```json
{
  "brand": "Toyota",
  "model": "Camry Hybrid",
  "registration_number": "WA-789-ABC",
  "manufacturing_year": 2022,
  "fuel_type": "HYBRID",
  "color": "Silver",
  "mileage": 24500,
  "vin_number": "4T1B11HK5NU123456"
}
```

### 3. Vehicle Detail / Update / Delete
- **Endpoint**: `GET /api/cars/{id}/`, `PUT /api/cars/{id}/`, `DELETE /api/cars/{id}/`
- **Auth**: `Bearer <token>`

---

## Service Requests & Categories

### 1. List Service Categories
- **Endpoint**: `GET /api/service-categories/`
- **Auth**: `Bearer <token>`
- **Response**: List of active categories with estimated duration and base fee.

### 2. Create Service Request (Booking)
- **Endpoint**: `POST /api/service-requests/`
- **Auth**: `Bearer <token>` (Customer)
- **Request Body**:
```json
{
  "car_id": 1,
  "service_category_id": 2,
  "preferred_date": "2026-09-15",
  "preferred_time": "10:00 AM",
  "current_mileage": 25000,
  "description": "Oil change and 60-point multi-system inspection"
}
```
- **Response `201 Created`**: Returns ticket with auto-generated ID (e.g. `CSMS-2026-00001`) and status `PENDING`.

### 3. Cancel Service Request
- **Endpoint**: `PUT /api/service-requests/{id}/cancel/`
- **Auth**: `Bearer <token>` (Customer)
- **Request Body**: `{ "remarks": "Need to reschedule" }`

---

## Administrator Management

### 1. Assign Engineer
- **Endpoint**: `PUT /api/admin/service-requests/{id}/assign/`
- **Auth**: `Bearer <token>` (Admin)
- **Request Body**:
```json
{
  "engineer_id": 2,
  "estimated_cost": 165.00,
  "remarks": "Allocated to Bay 3 for inspection scan"
}
```

### 2. Onboard Service Engineer
- **Endpoint**: `POST /api/admin/engineers/`
- **Auth**: `Bearer <token>` (Admin)
- **Request Body**:
```json
{
  "full_name": "Sarah Jenkins",
  "email": "sarah.engineer@csms.com",
  "phone": "+1-800-555-0202",
  "employee_id": "ENG-102",
  "specialization": "EV & High-Voltage Systems",
  "experience_years": 6,
  "password": "Engineer@123"
}
```

### 3. Admin Analytics KPIs
- **Endpoint**: `GET /api/analytics/admin/`
- **Auth**: `Bearer <token>` (Admin)
- **Response**: Counter metrics, monthly volume lists, revenue timeline, status distribution.

---

## Service Engineer Bay Management

### 1. List Assigned Workorders
- **Endpoint**: `GET /api/engineer/services/`
- **Auth**: `Bearer <token>` (Engineer)
- **Query Params**: `status`

### 2. Transition Status
- **Endpoint**: `PUT /api/engineer/services/{id}/status/`
- **Auth**: `Bearer <token>` (Engineer)
- **Request Body**:
```json
{
  "status": "IN_PROGRESS",
  "remarks": "Vehicle positioned on lift. Scanned DTC fault codes."
}
```

### 3. Log Technical Note
- **Endpoint**: `POST /api/engineer/services/{id}/notes/`
- **Auth**: `Bearer <token>` (Engineer)
- **Request Body**: `{ "notes": "Rotor thickness measured at 24.2 mm (within tolerance)" }`

---

## Invoicing & Payments

### 1. List Invoices
- **Endpoint**: `GET /api/invoices/`
- **Auth**: `Bearer <token>` (Customer sees own, Admin sees all)

### 2. Record Payment
- **Endpoint**: `POST /api/invoices/{id}/payments/`
- **Auth**: `Bearer <token>` (Admin)
- **Request Body**:
```json
{
  "amount": 194.70,
  "payment_method": "CARD",
  "transaction_reference": "AUTH-TXN-99824"
}
```
