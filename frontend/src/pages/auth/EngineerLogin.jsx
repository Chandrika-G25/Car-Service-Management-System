import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wrench, Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const EngineerLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password, 'ENGINEER');
      navigate('/engineer/dashboard');
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        'Invalid service engineer credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div
            className="auth-logo"
            style={{
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              color: '#fbbf24',
            }}
          >
            <Wrench size={28} />
          </div>
          <span className="auth-role-tag auth-role-engineer">Service Technician Portal</span>
          <h2>Engineer Login</h2>
          <p>Access assigned bay tickets, vehicle inspection logs & repair checklists</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Engineer Email</label>
            <input
              type="email"
              required
              className="form-control"
              placeholder="john.engineer@csms.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
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

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: '100%',
              marginTop: '1rem',
              background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
            }}
            disabled={loading}
          >
            {loading ? 'Authenticating Technician...' : 'Access Service Bay'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="portal-switch-links">
          <Link to="/customer/login">Customer Login</Link>
          <span style={{ color: 'var(--border-subtle)' }}>•</span>
          <Link to="/admin/login">Admin Console</Link>
          <span style={{ color: 'var(--border-subtle)' }}>•</span>
          <Link to="/">Home</Link>
        </div>
      </div>
    </div>
  );
};

export default EngineerLogin;
