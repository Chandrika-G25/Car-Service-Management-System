import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export const Contact = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ maxWidth: '1000px', margin: '4rem auto', padding: '0 2rem', flex: 1 }}>
        <h1 style={{ fontSize: '2.75rem', marginBottom: '1rem' }}>Contact & Support</h1>
        <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', marginBottom: '3rem' }}>
          Have questions regarding service intervals or workshop inquiries? Reach out to our team.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem' }}>
          <div>
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <MapPin size={24} color="var(--primary)" />
                <div>
                  <h4 style={{ margin: 0 }}>Service Center Facility</h4>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>450 Automotive Way, Bay Area</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <Phone size={24} color="var(--primary)" />
                <div>
                  <h4 style={{ margin: 0 }}>Toll-Free Dispatch</h4>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>+1 (800) 555-2767</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Mail size={24} color="var(--primary)" />
                <div>
                  <h4 style={{ margin: 0 }}>Technical Support</h4>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>service@csms-auto.com</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            {submitted ? (
              <div className="alert alert-success">
                Thank you! Your message has been transmitted to our service advisor team.
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    required
                    className="form-control"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea
                    rows={4}
                    required
                    className="form-control"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  <Send size={16} /> Send Inquiry
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;
