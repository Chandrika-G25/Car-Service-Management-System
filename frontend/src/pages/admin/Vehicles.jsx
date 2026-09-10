import React, { useState, useEffect } from 'react';
import { Car, Search, Fuel, Gauge, Calendar, User } from 'lucide-react';
import { adminService } from '../../services/adminService';
import Loading from '../../components/Loading';

export const AdminVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [fuelFilter, setFuelFilter] = useState('');

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (fuelFilter) params.fuel_type = fuelFilter;
      const res = await adminService.getAdminVehicles(params);
      setVehicles(res.results || res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [fuelFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchVehicles();
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h1>Vehicle Registry</h1>
          <p>Complete garage fleet database across all registered customers.</p>
        </div>
      </div>

      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '240px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search by license plate, brand, model, owner name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ minWidth: '160px' }}>
            <select
              className="form-select"
              value={fuelFilter}
              onChange={(e) => setFuelFilter(e.target.value)}
            >
              <option value="">All Fuel Types</option>
              <option value="PETROL">Petrol</option>
              <option value="DIESEL">Diesel</option>
              <option value="ELECTRIC">Electric</option>
              <option value="HYBRID">Hybrid</option>
              <option value="CNG">CNG</option>
            </select>
          </div>

          <button type="submit" className="btn btn-secondary">
            <Search size={16} /> Filter
          </button>
        </form>
      </div>

      {loading ? (
        <Loading message="Fetching vehicle records..." />
      ) : vehicles.length === 0 ? (
        <div className="card empty-state">
          <Car size={40} />
          <h3>No Vehicles Found</h3>
          <p>No automobile entries matched your search filters.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Plate / Registration</th>
                  <th>Vehicle Spec</th>
                  <th>Owner</th>
                  <th>Fuel</th>
                  <th>Odometer</th>
                  <th>VIN</th>
                  <th>Registered</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((car) => (
                  <tr key={car.id}>
                    <td style={{ fontWeight: 700, color: 'var(--accent)' }}>{car.registration_number}</td>
                    <td>
                      <strong>{car.brand} {car.model}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        Year: {car.manufacturing_year} • {car.color || 'Standard Color'}
                      </div>
                    </td>
                    <td>
                      <strong>{car.customer_name}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        {car.customer_email}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-assigned">{car.fuel_type}</span>
                    </td>
                    <td>{car.mileage?.toLocaleString()} km</td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {car.vin_number || 'N/A'}
                      </span>
                    </td>
                    <td>{new Date(car.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVehicles;
