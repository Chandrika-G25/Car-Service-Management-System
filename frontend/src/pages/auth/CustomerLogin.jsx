import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car, Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const CustomerLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password, 'CUSTOMER');
      navigate('/customer/dashboard');
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        'Invalid email or password. Please verify credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <Car size={28} />
          </div>
          <span className="auth-role-tag auth-role-customer">Customer Portal</span>
          <h2>Customer Login</h2>
          <p>Access your vehicle garage, service history & invoices</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                className="form-control"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">Password</label>
              <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("To reset your password, please contact our service center desk."); }} style={{ fontSize: '0.8rem' }}>
                Forgot Password?
              </a>
            </div>
            <div className="password-field-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <label htmlFor="remember" style={{ fontSize: '0.875rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
              Remember this device
            </label>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?{' '}
          <Link to="/customer/register" style={{ fontWeight: 600 }}>
            Register Vehicle Account
          </Link>
        </div>

        <div className="portal-switch-links">
          <Link to="/engineer/login">Engineer Portal</Link>
          <span style={{ color: 'var(--border-subtle)' }}>•</span>
          <Link to="/admin/login">Admin Desk</Link>
          <span style={{ color: 'var(--border-subtle)' }}>•</span>
          <Link to="/">Home</Link>
        </div>
      </div>
    </div>
  );
};

export default CustomerLogin;
