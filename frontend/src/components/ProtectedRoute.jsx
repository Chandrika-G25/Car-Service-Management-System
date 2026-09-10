import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loading from './Loading';

export const ProtectedRoute = ({ allowedRole }) => {
  const { user, isAuthenticated, loading, role } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loading message="Validating session..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to respective login route
    if (allowedRole === 'ADMIN') return <Navigate to="/admin/login" replace />;
    if (allowedRole === 'ENGINEER') return <Navigate to="/engineer/login" replace />;
    return <Navigate to="/customer/login" replace />;
  }

  // If role doesn't match allowedRole, redirect to appropriate role dashboard
  if (allowedRole && role !== allowedRole) {
    if (role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (role === 'ENGINEER') return <Navigate to="/engineer/dashboard" replace />;
    return <Navigate to="/customer/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
