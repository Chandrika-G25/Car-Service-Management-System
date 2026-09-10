import React from 'react';
import { Link } from 'react-router-dom';
import {
  Wrench,
  ShieldCheck,
  Clock,
  Car,
  FileText,
  CheckCircle,
  CalendarCheck,
  CreditCard,
  Award,
  ArrowRight,
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export const Home = () => {
  const serviceCategories = [
    { name: 'General Routine Service', desc: 'Comprehensive fluids, filters, and 60-point multi-system health check.', price: 'From $150' },
    { name: 'Synthetic Oil & Filter', desc: 'Full-synthetic high-mileage engine protection with OEM filter.', price: 'From $75' },
    { name: 'Brake Rotor & Pad Repair', desc: 'Precision ceramic pads, laser disc runout check, and hydraulic flush.', price: 'From $220' },
    { name: 'Advanced Diagnostics & ECU', desc: 'High-speed CAN bus scan, sensors testing, and telemetry calibration.', price: 'From $380' },
    { name: 'Climate Control & AC Overhaul', desc: 'R134a/R1234yf vacuum recharge, dye inspection, and anti-bacterial fog.', price: 'From $140' },
    { name: 'Laser 4-Wheel Alignment', desc: 'Computerized camber, caster, and toe calibration for optimum tyre life.', price: 'From $110' },
  ];

  const howItWorksSteps = [
    { num: '01', title: 'Register & Add Vehicle', desc: 'Create your account and register your vehicles by VIN or registration plate.' },
    { num: '02', title: 'Select Service & Schedule', desc: 'Pick your preferred maintenance package, booking date, and arrival slot.' },
    { num: '03', title: 'Specialist Assigned', desc: 'Our administrators allocate a certified automotive engineer dedicated to your car.' },
    { num: '04', title: '7-Stage Live Tracking', desc: 'Follow progress through inspection, repairs, and diagnostics in real-time.' },
    { num: '05', title: 'Transparent Invoicing', desc: 'Review detailed itemized invoice and pick up your vehicle ready to drive.' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* 2. Hero Section */}
      <section
        style={{
          padding: '6rem 2rem',
          background: 'radial-gradient(ellipse at 50% 20%, #172a45 0%, #0b0f17 80%)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ maxWidth: '880px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 1rem',
              borderRadius: '999px',
              backgroundColor: 'rgba(2, 132, 199, 0.15)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              color: '#38bdf8',
              fontSize: '0.85rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '1.5rem',
            }}
          >
            <ShieldCheck size={16} /> Enterprise Automobile Management
          </div>

          <h1 style={{ fontSize: '3.5rem', lineHeight: 1.15, marginBottom: '1.5rem', fontWeight: 800 }}>
            Smart Car Service Management
          </h1>

          <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '2.5rem', lineHeight: 1.6 }}>
            Manage your vehicle service with ease, transparency and confidence.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/customer/register" className="btn btn-primary btn-lg">
              Book a Service <ArrowRight size={18} />
            </Link>
            <Link to="/customer/login" className="btn btn-secondary btn-lg">
              Customer Login
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Services Section */}
      <section style={{ padding: '5rem 2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>Automotive Care Services</h2>
          <p style={{ color: 'var(--text-muted)' }}>Tailored maintenance programs handled by certified technicians.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
          {serviceCategories.map((s, idx) => (
            <div key={idx} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    background: 'rgba(2, 132, 199, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent)',
                    marginBottom: '1.25rem',
                  }}
                >
                  <Wrench size={22} />
                </div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{s.name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{s.desc}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                <span style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{s.price}</span>
                <Link to="/customer/register" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Book Now →</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Why Choose Us Section */}
      <section style={{ padding: '5rem 2rem', backgroundColor: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>Why Choose CSMS?</h2>
            <p style={{ color: 'var(--text-muted)' }}>Engineered for modern automobile owners who value transparency and precision.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            <div className="card">
              <ShieldCheck size={36} color="var(--primary)" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Certified Engineers</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Every service ticket is assigned to a verified engineer specializing in your vehicle manufacturer.
              </p>
            </div>
            <div className="card">
              <Clock size={36} color="#10b981" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>7-Stage Status Tracking</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                From arrival to multi-point diagnostic, repair, road test, and completion, stay updated at every milestone.
              </p>
            </div>
            <div className="card">
              <FileText size={36} color="#f59e0b" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Clear Itemized Invoicing</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No hidden surprises. View estimates upfront and access official digital invoices with payment breakdown.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. How It Works Section */}
      <section style={{ padding: '5rem 2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>How It Works</h2>
          <p style={{ color: 'var(--text-muted)' }}>Effortless car servicing in 5 simple stages.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          {howItWorksSteps.map((step, idx) => (
            <div key={idx} className="card" style={{ position: 'relative' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent)', opacity: 0.5, marginBottom: '0.5rem' }}>
                {step.num}
              </div>
              <h4 style={{ fontSize: '1.05rem', marginBottom: '0.5rem' }}>{step.title}</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>


      {/* 8. Call to Action */}
      <section style={{ padding: '6rem 2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Ready to Experience Smarter Car Service?</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2rem' }}>
            Book your next routine service or repair diagnostic in under 2 minutes.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/customer/register" className="btn btn-primary btn-lg">
              Create Customer Account
            </Link>
            <Link to="/customer/login" className="btn btn-secondary btn-lg">
              Access My Garage
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
