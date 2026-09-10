# Smart Car Service Management System (CSMS)

A real-world, enterprise-ready Python Full Stack web application engineered for automobile service centers, dealership repair bays, and multi-branch vehicle garages.

Built with **Django REST Framework (DRF)**, **ReactJS (Vite)**, **JWT Authentication**, and **Microsoft SQL Server (MSSQL)**.

---

## Table of Contents
- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [User Roles & Portals](#user-roles--portals)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Database Design & MSSQL Setup](#database-design--mssql-setup)
- [Installation & Quick Start](#installation--quick-start)
- [Demo Credentials](#demo-credentials)
- [Testing Instructions](#testing-instructions)
- [API Documentation](#api-documentation)
- [Deployment Instructions](#deployment-instructions)
- [Future Enhancements](#future-enhancements)

---

## Project Overview

CSMS replaces legacy, fragmented garage workflows with a streamlined digital platform. Automobile owners can register vehicles, schedule maintenance appointments, follow live 7-stage repair progress, and download itemized tax invoices. Service technicians manage assigned repair bays, document inspection findings, and record diagnostic notes. Workshop administrators oversee workload distribution, invoice billing, customer accounts, and real-time revenue analytics.

> [!NOTE]
> **Strict Architectural Adherence**: Zero usage of Docker, WebSockets, Django Channels, Redis, or Socket.IO. All operations use standard, secure REST APIs over HTTP/HTTPS.

---

## Key Features

- **Multi-Portal Role Architecture**: Separate portals for `/customer/login`, `/admin/login`, `/engineer/login`, and `/customer/register`.
- **Vehicle Fleet Management**: Full CRUD operations for customer automobiles (Brand, Model, Plate, Year, Fuel Type, Mileage, VIN).
- **7-Stage Service State Machine**:
  `PENDING` → `ASSIGNED` → `IN_PROGRESS` → `INSPECTION` → `REPAIRING` → `TESTING` → `COMPLETED` (or `CANCELLED`).
- **Live Visual Progress Tracker**: Real-time progress bar reflecting technician milestones without polling or socket overhead.
- **Service Audit Timeline**: Every transition automatically logs previous status, new status, technician remarks, and timestamps.
- **Invoicing & Payments**: Automatic invoice generation upon job completion, tax calculation, and payment recording (Cash, Card, UPI, Bank Transfer).
- **Database Notifications**: Real-time notification inbox with unread counter bell and mark-as-read controls.
- **Executive Admin Analytics**: Chart.js graphs for monthly service volume, status distributions, popular packages, and technician workloads.

---

## User Roles & Portals

| Role | Login Portal | Capabilities |
| :--- | :--- | :--- |
| **Customer** | `/customer/login` | Self-register, manage personal garage, book service tickets, track repairs, view invoices, receive notifications. |
| **Service Engineer** | `/engineer/login` | Access assigned bay workorders, advance stages, record technical notes and diagnostic measurements, mark completed. |
| **Admin** | `/admin/login` | Supervise workshop operations, onboard technicians, assign bay tickets, adjust costs, record payments, review financial reports. |

---

## Technology Stack

### Frontend:
- **HTML5 & CSS3**: Custom automotive dark/light theme, responsive layout, glassmorphism cards.
- **JavaScript (ES6+) & ReactJS (19.x)**: Modular component hierarchy, hooks, state management.
- **React Router v6**: Single-page routing with role-enforced protected route guards.
- **Axios**: HTTP client configured with JWT bearer authorization interceptor and automatic token refresh.
- **Chart.js & React-Chartjs-2**: Interactive line, bar, and doughnut charts.
- **Lucide Icons**: Crisp modern iconography.

### Backend:
- **Python 3.10+ / 3.14**: Clean modular architecture following PEP8 standards.
- **Django & Django REST Framework (DRF)**: High-performance RESTful APIs.
- **SimpleJWT (`djangorestframework-simplejwt`)**: Secure stateless token authentication.
- **CORS Headers (`django-cors-headers`)**: Cross-Origin Resource Sharing security.
- **Pillow**: Image processing for profile avatars and vehicle images.

### Database:
- **Primary**: **Microsoft SQL Server (MSSQL)** via `mssql-django` & `pyodbc` (ODBC Driver 18 for SQL Server).
- **Development Fallback**: Seamless switch to SQLite via `DB_ENGINE=sqlite3` for instant local testing without a live MSSQL instance.

---

## System Architecture

```
+-------------------------------------------------------------+
|                      React Frontend                         |
|  (Vite + React Router + Context API + Axios + Chart.js)    |
+------------------------------+------------------------------+
                               | REST APIs (HTTP / JSON)
                               | Bearer JWT (Access + Refresh)
                               v
+-------------------------------------------------------------+
|                  Django REST Framework                      |
|  (Accounts, Vehicles, Services, Invoices, Notifications)    |
+------------------------------+------------------------------+
                               | Django ORM
                               v
+-------------------------------------------------------------+
|              Microsoft SQL Server (MSSQL)                   |
|      (Tables, Relations, Constraints, Indexes, History)     |
+-------------------------------------------------------------+
```

---

## Project Structure

```
Carservice/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── .env
│   ├── config/              # Django settings, root URLs, WSGI
│   ├── accounts/            # Custom User, Profiles, Auth, Admin endpoints
│   ├── vehicles/            # Car models, serializers, views
│   ├── services/            # ServiceCategory, ServiceRequest, ServiceHistory
│   ├── notifications/       # Database Notification models and views
│   ├── invoices/            # Invoice and Payment models, billing logic
│   └── analytics/           # Aggregated KPIs and chart datasets
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── .env.example
│   ├── .env
│   └── src/
│       ├── components/      # Navbar, Sidebar, ProgressTracker, Modal, Bell
│       ├── pages/           # Public, Auth, Customer, Admin, Engineer pages
│       ├── services/        # Axios API clients
│       ├── context/         # AuthContext
│       ├── hooks/           # useAuth hook
│       ├── routes/          # AppRoutes definition
│       └── styles/          # global.css, auth.css, dashboard.css, responsive.css
├── PROJECT_DOCUMENTATION.md
├── API_DOCUMENTATION.md
├── .gitignore
└── README.md
```

---

## Database Design & MSSQL Setup

### Connecting to Microsoft SQL Server (MSSQL)

1. Ensure **ODBC Driver 18 for SQL Server** is installed on your workstation.
2. In SQL Server Management Studio (SSMS), create a database:
   ```sql
   CREATE DATABASE csms_db;
   GO
   ```
3. Update `backend/.env`:
   ```env
   DB_ENGINE=mssql
   DB_NAME=csms_db
   DB_USER=sa
   DB_PASSWORD=YourPassword123
   DB_HOST=localhost
   DB_PORT=1433
   DB_DRIVER=ODBC Driver 18 for SQL Server
   ```
4. Run migrations:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

*(Note: For instant out-of-the-box local testing without SQL Server active, set `DB_ENGINE=sqlite3` in `backend/.env`).*

---

## Installation & Quick Start

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment (Windows)
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Seed initial demonstration data
python manage.py seed_data

# Start Django backend server (port 8000)
python manage.py runserver 127.0.0.1:8000
```

### 2. Frontend Setup

```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install node dependencies
npm install

# Start Vite development server (port 5173)
npm run dev
```

Open your browser at **`http://127.0.0.1:5173/`**.

---

## Demo Credentials

All test accounts are pre-seeded via `python manage.py seed_data`:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@csms.com` | `Admin@123` | Chief Workshop Administrator |
| **Service Engineer** | `john.engineer@csms.com` | `Engineer@123` | Master Diagnostics Tech (ENG-101) |
| **Service Engineer** | `sarah.engineer@csms.com` | `Engineer@123` | EV & AC Specialist (ENG-102) |
| **Customer** | `alex.customer@example.com` | `Customer@123` | Owns 2 registered vehicles |
| **Customer** | `emily.customer@example.com` | `Customer@123` | Tesla Model 3 owner |

---

## Testing Instructions

Automated backend unit tests verify registration, authentication, role authorization, car CRUD, and the complete 7-stage service request lifecycle:

```bash
cd backend
python manage.py test accounts
```

To run end-to-end HTTP integration checks:
```bash
python ../scratch/verify_api.py
```

---

## Deployment Instructions

### Production Checklist:
1. **Backend**:
   - Set `DEBUG=False` in `backend/.env`.
   - Set unique `SECRET_KEY`.
   - Configure `ALLOWED_HOSTS` (e.g. `your-domain.onrender.com,your-domain.azurewebsites.net`).
   - Run `python manage.py collectstatic`.
   - Use WSGI server `gunicorn config.wsgi:application` or Azure App Service.
2. **Frontend**:
   - Set `VITE_API_BASE_URL=https://your-backend-api.com/api` in `frontend/.env`.
   - Run `npm run build` to generate optimized production artifacts in `frontend/dist/`.
   - Deploy `frontend/dist/` to Vercel, Netlify, or Azure Static Web Apps.

---

## Future Enhancements
- Integration of online payment gateways (Stripe, Razorpay, PayPal).
- Automated email & SMS reminders for scheduled maintenance.
- AI-based predictive maintenance and diagnostic fault recommendations.
- Spare parts inventory and warehouse stock management module.
- GPS workshop valet pickup and real-time transit tracking.
"# Car-service-" 
