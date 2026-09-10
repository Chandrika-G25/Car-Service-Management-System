import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, ArrowLeft, Plus } from 'lucide-react';
import { carService } from '../../services/carService';

export const AddCar = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    registration_number: '',
    manufacturing_year: new Date().getFullYear(),
    fuel_type: 'PETROL',
    color: '',
    mileage: 0,
    vin_number: '',
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
      await carService.createCar(formData);
      navigate('/customer/cars');
    } catch (err) {
      const resp = err.response?.data;
      if (resp?.registration_number) {
        setError(Array.isArray(resp.registration_number) ? resp.registration_number[0] : resp.registration_number);
      } else {
        setError(resp?.error || 'Failed to add vehicle. Please check the values.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-header">
        <div className="page-title">
          <button
            onClick={() => navigate('/customer/cars')}
            className="btn btn-secondary btn-sm"
            style={{ marginBottom: '0.75rem' }}
          >
            <ArrowLeft size={16} /> Back to Vehicles
          </button>
          <h1>Register New Vehicle</h1>
          <p>Add vehicle technical specifications to your service profile.</p>
        </div>
      </div>

      <div className="card">
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Vehicle Brand / Make *</label>
              <input
                type="text"
                name="brand"
                required
                className="form-control"
                placeholder="e.g. Honda, BMW, Tesla, Toyota"
                value={formData.brand}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Vehicle Model *</label>
              <input
                type="text"
                name="model"
                required
                className="form-control"
                placeholder="e.g. Civic, Model 3, 330i, RAV4"
                value={formData.model}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">License Plate / Registration Number *</label>
              <input
                type="text"
                name="registration_number"
                required
                className="form-control"
                placeholder="e.g. WA-789-ABC"
                value={formData.registration_number}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Manufacturing Year *</label>
              <input
                type="number"
                name="manufacturing_year"
                required
                min={1970}
                max={new Date().getFullYear() + 1}
                className="form-control"
                value={formData.manufacturing_year}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Powertrain / Fuel Type *</label>
              <select
                name="fuel_type"
                className="form-select"
                value={formData.fuel_type}
                onChange={handleChange}
              >
                <option value="PETROL">Petrol</option>
                <option value="DIESEL">Diesel</option>
                <option value="ELECTRIC">Electric</option>
                <option value="HYBRID">Hybrid</option>
                <option value="CNG">CNG</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Current Odometer (km)</label>
              <input
                type="number"
                name="mileage"
                min={0}
                className="form-control"
                placeholder="e.g. 24000"
                value={formData.mileage}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Exterior Color</label>
              <input
                type="text"
                name="color"
                className="form-control"
                placeholder="e.g. Obsidian Black, Sonic Grey"
                value={formData.color}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">VIN Number (Optional)</label>
              <input
                type="text"
                name="vin_number"
                className="form-control"
                placeholder="17-character VIN identifier"
                value={formData.vin_number}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/customer/cars')}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Plus size={16} /> {saving ? 'Registering Vehicle...' : 'Register Vehicle to Garage'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCar;
