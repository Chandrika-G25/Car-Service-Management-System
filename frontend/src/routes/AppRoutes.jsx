import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts & Guard
import ProtectedRoute from '../components/ProtectedRoute';
import DashboardLayout from '../components/DashboardLayout';

// Public Pages
import Home from '../pages/public/Home';
import About from '../pages/public/About';
import Contact from '../pages/public/Contact';

// Auth Pages
import CustomerLogin from '../pages/auth/CustomerLogin';
import CustomerRegister from '../pages/auth/CustomerRegister';
import AdminLogin from '../pages/auth/AdminLogin';
import EngineerLogin from '../pages/auth/EngineerLogin';

// Customer Pages
import CustomerDashboard from '../pages/customer/Dashboard';
import CustomerProfile from '../pages/customer/Profile';
import CustomerCars from '../pages/customer/Cars';
import AddCar from '../pages/customer/AddCar';
import BookService from '../pages/customer/BookService';
import CustomerServices from '../pages/customer/Services';
import CustomerServiceDetails from '../pages/customer/ServiceDetails';
import CustomerServiceHistory from '../pages/customer/ServiceHistory';
import CustomerInvoices from '../pages/customer/Invoices';
import CustomerNotifications from '../pages/customer/Notifications';

// Admin Pages
import AdminDashboard from '../pages/admin/Dashboard';
import AdminCustomers from '../pages/admin/Customers';
import AdminCustomerDetails from '../pages/admin/CustomerDetails';
import AdminVehicles from '../pages/admin/Vehicles';
import AdminEngineers from '../pages/admin/Engineers';
import AddEngineer from '../pages/admin/AddEngineer';
import AdminServiceRequests from '../pages/admin/ServiceRequests';
import AdminServiceDetails from '../pages/admin/ServiceDetails';
import AdminInvoices from '../pages/admin/Invoices';
import AdminReports from '../pages/admin/Reports';
import AdminSettings from '../pages/admin/Settings';

// Engineer Pages
import EngineerDashboard from '../pages/engineer/Dashboard';
import EngineerAssignedServices from '../pages/engineer/AssignedServices';
import EngineerServiceDetails from '../pages/engineer/ServiceDetails';
import EngineerUpdateStatus from '../pages/engineer/UpdateStatus';
import EngineerProfile from '../pages/engineer/Profile';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />

      {/* Authentication Portals */}
      <Route path="/customer/login" element={<CustomerLogin />} />
      <Route path="/customer/register" element={<CustomerRegister />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/engineer/login" element={<EngineerLogin />} />

      {/* Customer Protected Routes */}
      <Route element={<ProtectedRoute allowedRole="CUSTOMER" />}>
        <Route element={<DashboardLayout />}>
          <Route path="/customer/dashboard" element={<CustomerDashboard />} />
          <Route path="/customer/profile" element={<CustomerProfile />} />
          <Route path="/customer/cars" element={<CustomerCars />} />
          <Route path="/customer/cars/add" element={<AddCar />} />
          <Route path="/customer/services/book" element={<BookService />} />
          <Route path="/customer/services" element={<CustomerServices />} />
          <Route path="/customer/services/:id" element={<CustomerServiceDetails />} />
          <Route path="/customer/history" element={<CustomerServiceHistory />} />
          <Route path="/customer/invoices" element={<CustomerInvoices />} />
          <Route path="/customer/notifications" element={<CustomerNotifications />} />
        </Route>
      </Route>

      {/* Admin Protected Routes */}
      <Route element={<ProtectedRoute allowedRole="ADMIN" />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/customers" element={<AdminCustomers />} />
          <Route path="/admin/customers/:id" element={<AdminCustomerDetails />} />
          <Route path="/admin/vehicles" element={<AdminVehicles />} />
          <Route path="/admin/engineers" element={<AdminEngineers />} />
          <Route path="/admin/engineers/add" element={<AddEngineer />} />
          <Route path="/admin/services" element={<AdminServiceRequests />} />
          <Route path="/admin/services/:id" element={<AdminServiceDetails />} />
          <Route path="/admin/invoices" element={<AdminInvoices />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Route>
      </Route>

      {/* Engineer Protected Routes */}
      <Route element={<ProtectedRoute allowedRole="ENGINEER" />}>
        <Route element={<DashboardLayout />}>
          <Route path="/engineer/dashboard" element={<EngineerDashboard />} />
          <Route path="/engineer/services" element={<EngineerAssignedServices />} />
          <Route path="/engineer/services/:id" element={<EngineerServiceDetails />} />
          <Route path="/engineer/update-status" element={<EngineerUpdateStatus />} />
          <Route path="/engineer/profile" element={<EngineerProfile />} />
        </Route>
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
