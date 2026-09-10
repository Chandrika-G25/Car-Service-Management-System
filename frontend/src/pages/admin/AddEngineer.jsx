import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Plus } from 'lucide-react';
import { adminService } from '../../services/adminService';

export const AddEngineer = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    employee_id: '',
    specialization: '',
    experience_years: 0,
    joining_date: new Date().toISOString().split('T')[0],
    password: '',
  });

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      await adminService.createEngineer(formData);
      navigate('/admin/engineers');
    } catch (err) {
      const resp = err.response?.data;
      if (resp?.email) setError(Array.isArray(resp.email) ? resp.email[0] : resp.email);
      else if (resp?.employee_id) setError(Array.isArray(resp.employee_id) ? resp.employee_id[0] : resp.employee_id);
      else setError(resp?.error || 'Failed to onboard engineer. Verify fields.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-header">
        <div className="page-title">
          <button
            onClick={() => navigate('/admin/engineers')}
            className="btn btn-secondary btn-sm"
            style={{ marginBottom: '0.75rem' }}
          >
            <ArrowLeft size={16} /> Back to Engineers
          </button>
          <h1>Onboard Service Engineer</h1>
          <p>Create technician credentials and register their automotive diagnostic specialization.</p>
        </div>
      </div>

      <div className="card">
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                name="full_name"
                required
                className="form-control"
                placeholder="e.g. Johnathan Reynolds"
                value={formData.full_name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Official Email Address *</label>
              <input
                type="email"
                name="email"
                required
                className="form-control"
                placeholder="tech.id@csms.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Phone *</label>
              <input
                type="tel"
                name="phone"
                required
                className="form-control"
                placeholder="+1 (800) 555-0201"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Employee ID *</label>
              <input
                type="text"
                name="employee_id"
                required
                className="form-control"
                placeholder="e.g. ENG-103"
                value={formData.employee_id}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Technical Specialization *</label>
              <input
                type="text"
                name="specialization"
                required
                className="form-control"
                placeholder="e.g. Transmission, Hybrid Powertrain, AC"
                value={formData.specialization}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Experience (Years)</label>
              <input
                type="number"
                name="experience_years"
                min={0}
                className="form-control"
                value={formData.experience_years}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Joining Date</label>
              <input
                type="date"
                name="joining_date"
                className="form-control"
                value={formData.joining_date}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Initial Password *</label>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                className="form-control"
                placeholder="Assign temporary password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/admin/engineers')}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Plus size={16} /> {saving ? 'Registering...' : 'Complete Engineer Onboarding'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEngineer;
