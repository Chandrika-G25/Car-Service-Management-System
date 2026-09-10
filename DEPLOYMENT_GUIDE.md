# 🚀 CSMS Cloud Deployment Guide (Render + Vercel)

This guide walks you through deploying the **Smart Car Service Management System (CSMS)** to **Render** (Backend API) and **Vercel** (Frontend React App) completely free of charge.

---

## Architecture Overview
- **Backend API**: Django 5 + Django REST Framework + SimpleJWT + WhiteNoise + Gunicorn hosted on **Render** (Python Web Service).
- **Frontend SPA**: React 19 + Vite + Chart.js hosted on **Vercel** (Static / Edge CDN).
- **Database**: Automatic SQLite3 file on persistent disk or managed PostgreSQL on Render (using `DATABASE_URL`).

---

## 🛠️ Part 1: Deploy Backend on Render

### Step 1.1: Push Repository to GitHub
Ensure your latest changes are pushed to your GitHub repository:
```bash
git add .
git commit -m "Configure production deployment for Render and Vercel"
git push origin main
```

### Step 1.2: Create New Web Service on Render
1. Go to [https://dashboard.render.com](https://dashboard.render.com) and log in or sign up.
2. Click **New +** → **Web Service**.
3. Select **Build and deploy from a Git repository** and connect your repository: `Chandrika-G25/Car-Service-Management-System`.
4. Configure the service settings:
   - **Name**: `csms-backend` (or any unique name you prefer)
   - **Region**: Choose the closest region (e.g., *Oregon (US West)* or *Frankfurt*)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `bash build.sh`
   - **Start Command**: `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT`
   - **Instance Type**: `Free`

### Step 1.3: Configure Environment Variables on Render
Under the **Environment Variables** section, add:
| Key | Value | Description |
|---|---|---|
| `PYTHON_VERSION` | `3.11.9` | Recommended Python version |
| `DEBUG` | `False` | Production security mode |
| `SECRET_KEY` | *(Click Generate or paste a secure random string)* | Django cryptographic key |
| `ALLOWED_HOSTS` | `*` | Or `<your-backend-name>.onrender.com` |
| `CORS_ALLOW_ALL_ORIGINS` | `True` | Allows requests from your Vercel frontend |
| `DB_ENGINE` | `sqlite3` | Uses local database (or provide `DATABASE_URL` for Postgres) |

> 💡 **Optional PostgreSQL**: If you prefer Render PostgreSQL, create a **PostgreSQL** instance on Render and copy its **Internal Database URL** into the backend's `DATABASE_URL` environment variable. Django will automatically detect and connect to it!

### Step 1.4: Deploy & Verify
1. Click **Deploy Web Service**.
2. Wait for the build logs to finish (`python manage.py migrate`, `collectstatic`, and `seed_data` will run automatically via `build.sh`).
3. Once the status shows **Live**, copy your backend URL:
   `https://<your-service-name>.onrender.com`
4. Test it in your browser:
   `https://<your-service-name>.onrender.com/api/services/categories/` should return a JSON response with service categories.

---

## 🌐 Part 2: Deploy Frontend on Vercel

### Step 2.1: Import Project to Vercel
1. Go to [https://vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New...** → **Project**.
3. Select your repository: `Car-Service-Management-System`.
4. Under **Project Settings**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click **Edit** and choose `frontend`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `dist` (default)

### Step 2.2: Set Environment Variables on Vercel
In the **Environment Variables** section, add:
| Key | Value |
|---|---|
| `VITE_API_BASE_URL` | `https://<your-service-name>.onrender.com/api` |

*(Replace `<your-service-name>.onrender.com` with your actual Render backend URL from Part 1, making sure to append `/api`)*

### Step 2.3: Deploy & Launch
1. Click **Deploy**.
2. Vercel will build and deploy the React application in ~30 seconds.
3. You will receive your live domain, e.g. `https://car-service-management-system.vercel.app`.

---

## 🔑 Default Seed Accounts & Credentials

Once deployed, the `seed_data` command automatically provisions these ready-to-test accounts:

| Portal | Role | Email | Password |
|---|---|---|---|
| `/admin/login` | **Administrator** | `admin@csms.com` | `Admin@123` |
| `/engineer/login` | **Lead Engineer** | `john.engineer@csms.com` | `Engineer@123` |
| `/engineer/login` | **Senior Mechanic** | `sarah.engineer@csms.com` | `Engineer@123` |
| `/customer/login` | **Customer** | `alex.turner@example.com` | `Customer@123` |

Or register a brand new customer account at `/customer/register`!

---

## 🛡️ Production Verification Checklist
- [x] Static files served via WhiteNoise with compression & cache headers.
- [x] CORS allowed for Vercel deployment URLs (`https://*.vercel.app`).
- [x] SPA client routing configured via `vercel.json` (no 404s on browser reload).
- [x] JWT token refresh interceptor in React automatically handles session renewal.
- [x] Seed data script populates categories, vehicles, engineers, and service tickets on first launch.
