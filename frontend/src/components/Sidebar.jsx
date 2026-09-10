import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Car,
  CalendarPlus,
  Wrench,
  FileText,
  User,
  LogOut,
  Users,
  ShieldAlert,
  BarChart3,
  CheckCircle,
  Bell,
  Settings,
  X,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    if (role === 'ADMIN') navigate('/admin/login');
    else if (role === 'ENGINEER') navigate('/engineer/login');
    else navigate('/customer/login');
  };

  const customerLinks = [
    { to: '/customer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/customer/cars', label: 'My Cars', icon: Car },
    { to: '/customer/cars/add', label: 'Add Car', icon: Car },
    { to: '/customer/services/book', label: 'Book Service', icon: CalendarPlus },
    { to: '/customer/services', label: 'My Services', icon: Wrench },
    { to: '/customer/invoices', label: 'Invoices', icon: FileText },
    { to: '/customer/notifications', label: 'Notifications', icon: Bell },
    { to: '/customer/profile', label: 'My Profile', icon: User },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/customers', label: 'Customers', icon: Users },
    { to: '/admin/vehicles', label: 'Vehicles', icon: Car },
    { to: '/admin/engineers', label: 'Engineers', icon: ShieldAlert },
    { to: '/admin/services', label: 'Service Requests', icon: Wrench },
    { to: '/admin/invoices', label: 'Invoices', icon: FileText },
    { to: '/admin/reports', label: 'Reports & Analytics', icon: BarChart3 },
    { to: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const engineerLinks = [
    { to: '/engineer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/engineer/services', label: 'Assigned Services', icon: Wrench },
    { to: '/engineer/update-status', label: 'Update Status', icon: CheckCircle },
    { to: '/engineer/profile', label: 'Profile', icon: User },
  ];

  const links =
    role === 'ADMIN'
      ? adminLinks
      : role === 'ENGINEER'
      ? engineerLinks
      : customerLinks;

  const roleLabels = {
    ADMIN: 'Admin Portal',
    CUSTOMER: 'Customer Portal',
    ENGINEER: 'Engineer Portal',
  };

  return (
    <aside className={`dashboard-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Car size={22} />
        </div>
        <div className="brand-text">
          <h3>CSMS</h3>
          <span>{roleLabels[role] || 'Service Center'}</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="mobile-menu-toggle"
            style={{ marginLeft: 'auto' }}
          >
            <X size={20} />
          </button>
        )}
      </div>

      <div className="sidebar-nav">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="sidebar-footer">
        <button
          onClick={handleLogout}
          className="btn btn-secondary"
          style={{ width: '100%', justifyContent: 'flex-start' }}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
