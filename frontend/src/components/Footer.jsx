import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Shield, Wrench, Phone, Mail, MapPin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-subtle)',
        padding: '4rem 2rem 2rem 2rem',
        marginTop: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '2.5rem',
          marginBottom: '3rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              <Car size={20} />
            </div>
            <h3 style={{ fontSize: '1.25rem', margin: 0 }}>CSMS</h3>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Smart Car Service Management System. Streamlining automotive repairs, technician allocation, digital invoicing, and client satisfaction with transparent diagnostics.
          </p>
        </div>

        <div>
          <h4 style={{ fontSize: '1rem', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Portals
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', padding: 0 }}>
            <li><Link to="/customer/login" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Customer Portal</Link></li>
            <li><Link to="/customer/register" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Register Vehicle</Link></li>
            <li><Link to="/engineer/login" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Service Engineer Portal</Link></li>
            <li><Link to="/admin/login" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Administrative Desk</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: '1rem', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Quick Links
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', padding: 0 }}>
            <li><Link to="/" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Home Overview</Link></li>
            <li><Link to="/about" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>About System</Link></li>
            <li><Link to="/contact" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Support & Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: '1rem', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Center Info
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={16} color="var(--primary)" /> 450 Automotive Way, Tech Boulevard
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Phone size={16} color="var(--primary)" /> +1 (800) 555-CSMS (2767)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail size={16} color="var(--primary)" /> support@csms-auto.com
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '1.5rem',
          textAlign: 'center',
          color: 'var(--text-dim)',
          fontSize: '0.85rem',
        }}
      >
        © {new Date().getFullYear()} CSMS - Smart Car Service Management System. Built with Django REST Framework, ReactJS & Microsoft SQL Server.
      </div>
    </footer>
  );
};

export default Footer;
