import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car, User, Mail, Phone, Lock, MapPin, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const CustomerRegister = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters in length.');
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/customer/login');
      }, 2000);
    } catch (err) {
      const respData = err.response?.data;
      if (respData) {
        if (typeof respData === 'string') setError(respData);
        else if (respData.email) setError(Array.isArray(respData.email) ? respData.email[0] : respData.email);
        else if (respData.error) setError(respData.error);
        else setError(Object.values(respData)[0] || 'Registration failed.');
      } else {
        setError('Something went wrong. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card auth-card-wide">
        <div className="auth-header">
          <div className="auth-logo">
            <Car size={28} />
          </div>
          <span className="auth-role-tag auth-role-customer">Customer Registration</span>
          <h2>Create Customer Account</h2>
          <p>Register your garage profile to book appointments and track repairs</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {success ? (
          <div className="alert alert-success" style={{ textAlign: 'center', display: 'block', padding: '2rem' }}>
            <CheckCircle size={48} color="var(--success)" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ marginBottom: '0.5rem' }}>Registration Successful!</h3>
            <p style={{ color: 'var(--text-muted)' }}>
              Your customer profile has been created. Redirecting to login portal...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  name="full_name"
                  required
                  className="form-control"
                  placeholder="e.g. Alex Thompson"
                  value={formData.full_name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="form-control"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mobile Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  className="form-control"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  name="city"
                  className="form-control"
                  placeholder="Seattle"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">State / Province</label>
                <input
                  type="text"
                  name="state"
                  className="form-control"
                  placeholder="Washington"
                  value={formData.state}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Postal Code / Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  className="form-control"
                  placeholder="98101"
                  value={formData.pincode}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Street Address</label>
              <input
                type="text"
                name="address"
                className="form-control"
                placeholder="1042 Elm Street, Suite 400"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  className="form-control"
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password *</label>
                <input
                  type="password"
                  name="confirm_password"
                  required
                  minLength={6}
                  className="form-control"
                  placeholder="Confirm password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '1rem' }}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Complete Registration'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
        )}

        <div className="auth-footer">
          Already registered with CSMS?{' '}
          <Link to="/customer/login" style={{ fontWeight: 600 }}>
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CustomerRegister;
