import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Menu, User } from 'lucide-react';
import Sidebar from './Sidebar';
import NotificationBell from './NotificationBell';
import { useAuth } from '../hooks/useAuth';

export const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, role } = useAuth();

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle Navigation"
            >
              <Menu size={22} />
            </button>
            <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-muted)' }}>
              CSMS Automobile Bay
            </h4>
          </div>

          <div className="topbar-right">
            <NotificationBell />

            <Link
              to={role === 'ADMIN' ? '/admin/settings' : role === 'ENGINEER' ? '/engineer/profile' : '/customer/profile'}
              className="user-profile-badge"
              style={{ textDecoration: 'none' }}
            >
              <div className="user-avatar">
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {user?.full_name || 'User'}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {role}
                </div>
              </div>
            </Link>
          </div>
        </header>

        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
