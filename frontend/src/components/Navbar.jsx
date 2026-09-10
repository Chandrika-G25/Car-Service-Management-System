import React from 'react';
import { Link } from 'react-router-dom';
import { Car, User, Shield, Wrench } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Navbar = () => {
  const { isAuthenticated, role } = useAuth();

  const getDashboardPath = () => {
    if (role === 'ADMIN') return '/admin/dashboard';
    if (role === 'ENGINEER') return '/engineer/dashboard';
    return '/customer/dashboard';
  };

  return (
    <nav
      style={{
        height: '74px',
        backgroundColor: 'rgba(11, 15, 23, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        padding: '0 2rem',
        justifyContent: 'space-between',
      }}
    >
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}
        >
          <Car size={24} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.25rem', lineHeight: 1.1, margin: 0, color: 'white' }}>CSMS</h3>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', letterSpacing: '0.08em', fontWeight: 700, textTransform: 'uppercase' }}>
            Automotive Cloud
          </span>
        </div>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
        <Link to="/" style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.925rem' }}>
          Home
        </Link>
        <Link to="/about" style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.925rem' }}>
          About
        </Link>
        <Link to="/contact" style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.925rem' }}>
          Contact
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {isAuthenticated ? (
          <Link to={getDashboardPath()} className="btn btn-primary btn-sm">
            <User size={16} /> Open Dashboard
          </Link>
        ) : (
          <>
            <Link to="/customer/login" className="btn btn-secondary btn-sm">
              <User size={16} /> Customer Login
            </Link>
            <Link to="/customer/register" className="btn btn-primary btn-sm">
              <Wrench size={16} /> Book Service
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
