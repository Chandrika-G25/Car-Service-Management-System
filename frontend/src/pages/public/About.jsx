import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { ShieldCheck, Cpu, Database, Wrench } from 'lucide-react';

export const About = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ maxWidth: '1000px', margin: '4rem auto', padding: '0 2rem', flex: 1 }}>
        <h1 style={{ fontSize: '2.75rem', marginBottom: '1rem' }}>About CSMS</h1>
        <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', marginBottom: '3rem', lineHeight: 1.7 }}>
          The Smart Car Service Management System (CSMS) is an enterprise-grade automobile service management platform built for modern vehicle service centers, automotive dealerships, and workshop facilities.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
          <div className="card">
            <ShieldCheck size={32} color="var(--primary)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Role-Based Architecture</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Granular separation of duties across Customers, Certified Service Engineers, and Workshop Administrators.
            </p>
          </div>
          <div className="card">
            <Cpu size={32} color="#10b981" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>7-Stage State Machine</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Guaranteed lifecycle transitions from intake and assignment, through testing and completion with full audit logs.
            </p>
          </div>
          <div className="card">
            <Database size={32} color="#f59e0b" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Enterprise Database</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Backed by Microsoft SQL Server and Django REST Framework for transactional integrity and reliability.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default About;
